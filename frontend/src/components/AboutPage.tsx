import { Mail, MapPin, Phone, Store } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const galleryImages = [
  'https://images.unsplash.com/photo-1653868250450-b83e6263d427?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWF0aGVyJTIwc2hvZXMlMjBoZXJvfGVufDF8fHx8MTc2MTY1OTAzNnww&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1714905733230-702715038fa4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGFzc2ljJTIwc2hvZXN8ZW58MXx8fHwxNzYxNjU5MDM3fDA&ixlib=rb-4.1.0&q=80&w=1080',
  'https://images.unsplash.com/photo-1637059037982-519896b99b0f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXR1bW4lMjBib290c3xlbnwxfHx8fDE3NjE2NTkwMzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
];

const mapEmbedUrl = 'https://www.google.com/maps?q=Ivanovo&output=embed';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      

      <section className="max-w-[1440px] mx-auto px-6 py-12 lg:py-16">
        <div>
          <p className="text-gray-700 leading-8">
            ParaShoes — это магазин обуви из натуральной кожи, где стиль, качество и комфорт
            соединяются в каждой модели. Мы находимся в городе Иваново, в ТРЦ «Серебряный город»,
            на 3 этаже, магазин 4Б. Для нас обувь — это не просто часть гардероба, а важная деталь
            образа и ежедневного комфорта, поэтому мы внимательно подходим к выбору ассортимента и
            предлагаем покупателям только качественные модели из натуральной кожи. В ParaShoes мы
            стремимся помочь каждому найти обувь, которая будет радовать не только своим внешним
            видом, но и удобством в носке. Мы ценим индивидуальный подход, следим за актуальными
            тенденциями и стараемся сделать покупки приятными и комфортными как в магазине, так и в
            интернет-магазине. Наша цель — чтобы каждая пара обуви, приобретённая в ParaShoes,
            приносила уверенность, удобство и удовольствие каждый день.
          </p>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 pb-12 lg:pb-16" >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {galleryImages.map((imageUrl, index) => (
            <div key={imageUrl} className="rounded-2xl overflow-hidden border border-gray-200 bg-white h-[260px]">
              <ImageWithFallback
                src={imageUrl}
                alt={`ParaShoes gallery ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 pb-12 lg:pb-16" style={{paddingTop:"10px"}}>
        <div>
          <h2 className="text-gray-900 mb-6">Контактная информация</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2 text-gray-800">
                <Phone className="w-5 h-5 text-amber-700" />
                <span>Телефон</span>
              </div>
              <a href="tel:+79036325545" className="text-gray-700 hover:text-gray-900 transition-colors">
                +79036325545
              </a>
            </div>

            <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2 text-gray-800">
                <Mail className="w-5 h-5 text-amber-700" />
                <span>Почта</span>
              </div>
              <a
                href="mailto:sales@parashoes.ru"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                sales@parashoes.ru
              </a>
            </div>

            <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2 text-gray-800">
                <Store className="w-5 h-5 text-amber-700" />
                <span>Магазин</span>
              </div>
              <p className="text-gray-700">
                г. Иваново, ТРЦ «Серебряный город», 3 этаж, магазин 4Б
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 pb-16" style={{paddingTop:"10px"}}>
        <div>
          <div className="p-6 lg:p-8 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-amber-700" />
              <h2 className="text-gray-900">Мы на карте</h2>
            </div>
            
          </div>
          <div style= {{height:"700px", paddingBottom:"50px"}}>
            <iframe
              title="ParaShoes map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2172.696686746606!2d40.98145857797717!3d57.00537837357346!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x414d144740c45787%3A0x795cd2eeae80382!2z0KLQoNCmICLQodC10YDQtdCx0YDRj9C90YvQuSDQs9C-0YDQvtC0LCDRg9C7LiA4INCc0LDRgNGC0LAsIDMyLCDRjdGC0LDQtiA00JEsINCY0LLQsNC90L7QstC-LCDQmNCy0LDQvdC-0LLRgdC60LDRjyDQvtCx0LsuLCAxNTMwMzc!5e0!3m2!1sru!2sru!4v1772550520450!5m2!1sru!2sru"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

