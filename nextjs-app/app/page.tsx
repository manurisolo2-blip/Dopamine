import {
  SparklesPreview,
  SparklesPreviewDark,
  SparklesPreviewColorful,
} from "@/components/demo/sparkles-demo";
import { DemoOne } from "@/components/ui/demo";
import { ShippingGlobeSection } from "@/components/ui/shipping-globe-section";

export default function Home() {
  return (
    <main className="flex flex-col gap-12 bg-black min-h-screen pb-16">
      {/* Liquid Glass Component Section */}
      <section className="w-full">
        <DemoOne />
      </section>

      <div className="flex flex-col gap-8 p-8 max-w-6xl mx-auto w-full">
        <h1 className="text-white text-2xl font-bold text-center">
          SparklesCore — Demo Variants
        </h1>

        {/* Variant 1: Default with gradient lines */}
        <section>
          <h2 className="text-neutral-400 text-sm uppercase tracking-widest mb-2 text-center">
            Default
          </h2>
          <SparklesPreview />
        </section>

        {/* Variant 2: Full background sparkles */}
        <section>
          <h2 className="text-neutral-400 text-sm uppercase tracking-widest mb-2 text-center">
            Dark Full Background
          </h2>
          <SparklesPreviewDark />
        </section>

        {/* Variant 3: Colorful sparkles */}
        <section>
          <h2 className="text-neutral-400 text-sm uppercase tracking-widest mb-2 text-center">
            Colorful
          </h2>
          <SparklesPreviewColorful />
        </section>
      </div>

      {/* Worldwide Shipping & Global Logistics Globe Section (Debajo de los productos antes del footer) */}
      <section className="w-full">
        <ShippingGlobeSection />
      </section>
    </main>
  );
}

