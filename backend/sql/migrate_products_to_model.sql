BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ensure model table exists if a legacy name was used.
DO $$
BEGIN
  IF to_regclass('public.model') IS NULL AND to_regclass('public.products') IS NOT NULL THEN
    ALTER TABLE public.products RENAME TO model;
  END IF;
END $$;

-- New canonical table: one row per model + size with explicit stock.
CREATE TABLE IF NOT EXISTS public.model_size_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid NOT NULL REFERENCES public.model(id) ON DELETE CASCADE,
  size integer NOT NULL CHECK (size BETWEEN 35 AND 45),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  UNIQUE (model_id, size)
);

CREATE INDEX IF NOT EXISTS idx_model_size_stock_model_id
  ON public.model_size_stock(model_id);

CREATE INDEX IF NOT EXISTS idx_model_size_stock_size
  ON public.model_size_stock(size);

-- Migrate stock from legacy table public.product where one row = one physical unit.
DO $$
BEGIN
  IF to_regclass('public.product') IS NOT NULL THEN
    INSERT INTO public.model_size_stock (model_id, size, stock)
    SELECT p.model_id, p.size, COUNT(*)::int AS stock
    FROM public.product p
    GROUP BY p.model_id, p.size
    ON CONFLICT (model_id, size) DO UPDATE
      SET stock = EXCLUDED.stock;
  END IF;
END $$;

-- If legacy boolean size columns are still present, create zero-stock rows for selected sizes.
DO $$
BEGIN
  IF to_regclass('public.model') IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'model'
        AND column_name = 'size35'
    ) THEN
    INSERT INTO public.model_size_stock (model_id, size, stock)
    SELECT src.model_id, src.size, 0
    FROM (
      SELECT id AS model_id, 35 AS size FROM public.model WHERE size35 IS TRUE
      UNION ALL
      SELECT id AS model_id, 36 AS size FROM public.model WHERE size36 IS TRUE
      UNION ALL
      SELECT id AS model_id, 37 AS size FROM public.model WHERE size37 IS TRUE
      UNION ALL
      SELECT id AS model_id, 38 AS size FROM public.model WHERE size38 IS TRUE
      UNION ALL
      SELECT id AS model_id, 39 AS size FROM public.model WHERE size39 IS TRUE
      UNION ALL
      SELECT id AS model_id, 40 AS size FROM public.model WHERE size40 IS TRUE
      UNION ALL
      SELECT id AS model_id, 41 AS size FROM public.model WHERE size41 IS TRUE
      UNION ALL
      SELECT id AS model_id, 42 AS size FROM public.model WHERE size42 IS TRUE
      UNION ALL
      SELECT id AS model_id, 43 AS size FROM public.model WHERE size43 IS TRUE
      UNION ALL
      SELECT id AS model_id, 44 AS size FROM public.model WHERE size44 IS TRUE
      UNION ALL
      SELECT id AS model_id, 45 AS size FROM public.model WHERE size45 IS TRUE
    ) AS src
    ON CONFLICT (model_id, size) DO NOTHING;
  END IF;
END $$;

-- Remove legacy per-model aggregate and old size flags.
ALTER TABLE public.model DROP COLUMN IF EXISTS "quantityInStock";
ALTER TABLE public.model DROP COLUMN IF EXISTS size35;
ALTER TABLE public.model DROP COLUMN IF EXISTS size36;
ALTER TABLE public.model DROP COLUMN IF EXISTS size37;
ALTER TABLE public.model DROP COLUMN IF EXISTS size38;
ALTER TABLE public.model DROP COLUMN IF EXISTS size39;
ALTER TABLE public.model DROP COLUMN IF EXISTS size40;
ALTER TABLE public.model DROP COLUMN IF EXISTS size41;
ALTER TABLE public.model DROP COLUMN IF EXISTS size42;
ALTER TABLE public.model DROP COLUMN IF EXISTS size43;
ALTER TABLE public.model DROP COLUMN IF EXISTS size44;
ALTER TABLE public.model DROP COLUMN IF EXISTS size45;

-- Drop obsolete triggers/functions used to sync quantityInStock.
DROP TRIGGER IF EXISTS trg_sync_model_quantity_in_stock ON public.product;
DROP TRIGGER IF EXISTS trg_enforce_model_quantity_in_stock ON public.model;
DROP FUNCTION IF EXISTS public.sync_model_quantity_in_stock();
DROP FUNCTION IF EXISTS public.enforce_model_quantity_in_stock();

-- Migrate cart to model_id + size.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'cart' AND column_name = 'product_id'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'cart' AND column_name = 'model_id'
  ) THEN
    ALTER TABLE public.cart RENAME COLUMN product_id TO model_id;
  END IF;
END $$;

ALTER TABLE public.cart ADD COLUMN IF NOT EXISTS size integer;

UPDATE public.cart c
SET size = COALESCE(
  (
    SELECT s.size
    FROM public.model_size_stock s
    WHERE s.model_id = c.model_id
    ORDER BY s.stock DESC, s.size ASC
    LIMIT 1
  ),
  35
)
WHERE c.size IS NULL;

ALTER TABLE public.cart
  ALTER COLUMN size SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'cart_size_check'
  ) THEN
    ALTER TABLE public.cart
      ADD CONSTRAINT cart_size_check CHECK (size BETWEEN 35 AND 45);
  END IF;
END $$;

DROP INDEX IF EXISTS public."IDX_cart_user_product_unique";
CREATE UNIQUE INDEX IF NOT EXISTS idx_cart_user_model_size_unique
  ON public.cart(user_id, model_id, size);

-- Migrate order_items to model_id + size.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'order_items' AND column_name = 'product_id'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'order_items' AND column_name = 'model_id'
  ) THEN
    ALTER TABLE public.order_items RENAME COLUMN product_id TO model_id;
  END IF;
END $$;

ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS size integer;

UPDATE public.order_items oi
SET size = COALESCE(
  (
    SELECT s.size
    FROM public.model_size_stock s
    WHERE s.model_id = oi.model_id
    ORDER BY s.stock DESC, s.size ASC
    LIMIT 1
  ),
  35
)
WHERE oi.size IS NULL;

ALTER TABLE public.order_items
  ALTER COLUMN size SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'order_items_size_check'
  ) THEN
    ALTER TABLE public.order_items
      ADD CONSTRAINT order_items_size_check CHECK (size BETWEEN 35 AND 45);
  END IF;
END $$;

-- Remove legacy table where one row represented one physical pair.
DROP TABLE IF EXISTS public.product;

COMMIT;
