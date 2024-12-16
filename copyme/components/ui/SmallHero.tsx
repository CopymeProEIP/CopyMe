import Image from "next/image";

import { Button } from "@/components/ui/button";

export function SmallHero() {
  return (
    <section id="hero">
      <div className="container mx-auto px-4 py-12 md:py-24 lg:py-32 bg-slate-500">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-2">
            <div className="text-center space-y-2 mx-auto lg:text-left lg:mx-0">
              <h1 className="text-[42px] font-medium mb-2 text-balance max-w-3xl mx-auto tracking-tighter lg:mx-0">
                Streamline Your Workflow with Our SaaS Solution
              </h1>
            </div>
            <p className="text-muted-foreground max-w-[600px] mx-auto lg:mx-0">
              Boost productivity, enhance collaboration, and simplify your
              business processes with our powerful and intuitive
              software-as-a-service platform.
            </p>
            <div className="flex justify-center lg:justify-start">
              <Button variant="default">Start Your Free Trial</Button>
            </div>
          </div>
          <Image
            alt="Mobile app screenshot"
            className="aspect-video object-cover rounded-lg"
            height="366"
            src="/project.png"
            width="550"
          />
        </div>
      </div>
    </section>
  );
}
