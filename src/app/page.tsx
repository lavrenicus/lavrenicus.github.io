import Hero from "@/components/Hero";

const PERSON_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Lavrenicus",
  url: "https://lavrenicus.github.io/",
  jobTitle: "Technical Artist & Pipeline Engineer",
  sameAs: [
    "https://github.com/lavrenicus",
    "https://www.linkedin.com/in/ilialavrov/",
    "https://sketchfab.com/modelicus",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSON_LD) }}
      />
      <Hero />
    </>
  );
}
