const companies = [
  "eip",
];

export function Companies() {
  return (
    <section id="companies">
      <div className="py-10">
        <div className="container mx-auto px-4 md:px-8">
          <h3 className="text-center text-sm font-semibold text-gray-500">
            Ils nous font confiance
          </h3>
          <div className="relative mt-6">
            <div className="flex items-center justify-center">
            {/* <div className="grid grid-cols-2 place-items-center gap-2 md:grid-cols-4 xl:grid-cols-8 xl:gap-4"> */}
              {companies.map((logo, idx) => (
                <img
                  key={idx}
                  src={`/${logo}.png`}
                  className="h-10 w-40 px-2 dark:brightness-0 dark:invert"
                  alt={logo}
                />
              ))}
            {/* </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
