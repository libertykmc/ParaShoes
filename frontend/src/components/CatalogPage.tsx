import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from './ui/button';
import { ProductCard } from './ProductCard';
import { Product } from '../data/products';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

interface CatalogPageProps {
  products: Product[];
  onAddToCart: (productId: string) => void;
  onToggleFavorite: (productId: string) => void;
  onViewProduct: (productId: string) => void;
  favorites: Set<string>;
}

export function CatalogPage({ 
  products, 
  onAddToCart, 
  onToggleFavorite, 
  onViewProduct,
  favorites 
}: CatalogPageProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 30000]);

  const categories = ['Классика', 'Спорт', 'Осень', 'Зима'];
  const materials = ['Натуральная кожа', 'Искусственная кожа', 'Замша', 'Нубук'];
  const styles = ['Классика', 'Спорт'];
  const seasons = ['Весна', 'Лето', 'Осень', 'Зима'];

  const toggleFilter = (value: string, selected: string[], setter: (values: string[]) => void) => {
    if (selected.includes(value)) {
      setter(selected.filter(v => v !== value));
    } else {
      setter([...selected, value]);
    }
  };

  const filteredProducts = products.filter(product => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) return false;
    if (selectedMaterials.length > 0 && !selectedMaterials.includes(product.material)) return false;
    if (selectedStyles.length > 0 && !selectedStyles.includes(product.style)) return false;
    if (selectedSeasons.length > 0 && !selectedSeasons.includes(product.season)) return false;
    if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
    return true;
  });

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedMaterials([]);
    setSelectedStyles([]);
    setSelectedSeasons([]);
    setPriceRange([0, 30000]);
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-gray-900">Фильтры</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Очистить
        </Button>
      </div>

      {/* Categories */}
      <div>
        <h4 className="text-gray-900 mb-3">Категория</h4>
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleFilter(category, selectedCategories, setSelectedCategories)}
              />
              <Label htmlFor={`category-${category}`} className="text-sm cursor-pointer">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Materials */}
      <div>
        <h4 className="text-gray-900 mb-3">Материал</h4>
        <div className="space-y-2">
          {materials.map(material => (
            <div key={material} className="flex items-center space-x-2">
              <Checkbox
                id={`material-${material}`}
                checked={selectedMaterials.includes(material)}
                onCheckedChange={() => toggleFilter(material, selectedMaterials, setSelectedMaterials)}
              />
              <Label htmlFor={`material-${material}`} className="text-sm cursor-pointer">
                {material}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Styles */}
      <div>
        <h4 className="text-gray-900 mb-3">Стиль</h4>
        <div className="space-y-2">
          {styles.map(style => (
            <div key={style} className="flex items-center space-x-2">
              <Checkbox
                id={`style-${style}`}
                checked={selectedStyles.includes(style)}
                onCheckedChange={() => toggleFilter(style, selectedStyles, setSelectedStyles)}
              />
              <Label htmlFor={`style-${style}`} className="text-sm cursor-pointer">
                {style}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Seasons */}
      <div>
        <h4 className="text-gray-900 mb-3">Сезон</h4>
        <div className="space-y-2">
          {seasons.map(season => (
            <div key={season} className="flex items-center space-x-2">
              <Checkbox
                id={`season-${season}`}
                checked={selectedSeasons.includes(season)}
                onCheckedChange={() => toggleFilter(season, selectedSeasons, setSelectedSeasons)}
              />
              <Label htmlFor={`season-${season}`} className="text-sm cursor-pointer">
                {season}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-gray-900 mb-3">Цена</h4>
        <Slider
          min={0}
          max={30000}
          step={1000}
          value={priceRange}
          onValueChange={setPriceRange}
          className="mb-2"
        />
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{priceRange[0].toLocaleString('ru-RU')} ₽</span>
          <span>{priceRange[1].toLocaleString('ru-RU')} ₽</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Каталог</h1>
          <p className="text-gray-600">Найдено товаров: {filteredProducts.length}</p>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-24">
              <FilterPanel />
            </div>
          </aside>

          {/* Mobile Filters */}
          <div className="lg:hidden fixed bottom-6 right-6 z-40">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="lg" className="bg-amber-700 hover:bg-amber-800 shadow-lg">
                  <Filter className="w-5 h-5 mr-2" />
                  Фильтры
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:w-96 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Фильтры</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterPanel />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onToggleFavorite={onToggleFavorite}
                    onViewProduct={onViewProduct}
                    isFavorite={favorites.has(product.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-500 mb-4">Товары не найдены</p>
                <Button variant="outline" onClick={clearFilters}>
                  Сбросить фильтры
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
