BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF to_regclass('public.model') IS NULL AND to_regclass('public.products') IS NOT NULL THEN
    ALTER TABLE public.products RENAME TO model;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.product (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id uuid NOT NULL REFERENCES public.model(id) ON DELETE CASCADE,
  size integer NOT NULL CHECK (size BETWEEN 35 AND 45),
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_model_id ON public.product(model_id);
CREATE INDEX IF NOT EXISTS idx_product_model_size ON public.product(model_id, size);

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
    INSERT INTO public.product (model_id, size)
    SELECT src.model_id, src.size
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
    LEFT JOIN public.product p
      ON p.model_id = src.model_id
     AND p.size = src.size
    WHERE p.id IS NULL;
  END IF;
END $$;

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

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'model'
      AND column_name = 'quantityInStock'
  ) THEN
    UPDATE public.model m
    SET "quantityInStock" = COALESCE(s.cnt, 0)
    FROM (
      SELECT model_id, COUNT(*)::int AS cnt
      FROM public.product
      GROUP BY model_id
    ) AS s
    WHERE m.id = s.model_id;

    UPDATE public.model m
    SET "quantityInStock" = 0
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.product p
      WHERE p.model_id = m.id
    );
  END IF;
END $$;

DROP TABLE IF EXISTS public.products;

COMMIT;
