const AboutPage = () => {
  const values = [
    {
      title: "Interactive Guidance",
      description: "ArchitAI guides you step-by-step through system design questions.",
    },
    {
      title: "Fast Diagrams",
      description: "Generate clean, professional system design diagrams instantly.",
    },
    {
      title: "Save & Revisit",
      description: "All your sessions are saved so you can revisit or continue anytime.",
    },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero / Title Section */}
      <section className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          About ArchitAI
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto">
          ArchitAI helps developers and architects generate system design diagrams interactively using AI guidance.
        </p>
      </section>

      {/* Values / Mission Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Our Key Values</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {values.map((v, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300"
              >
                <h3 className="text-xl font-semibold mb-2">{v.title}</h3>
                <p className="text-gray-600">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Help Section */}
      <section className="py-24 bg-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">How ArchitAI Helps</h2>
        <p className="max-w-3xl mx-auto text-gray-700 text-lg md:text-xl">
          ArchitAI collects your input through guided questions, understands your system requirements, and produces a polished, downloadable system design diagram. It’s like having an AI design assistant ready at your fingertips.
        </p>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Designing Today</h2>
        <button
          onClick={() => window.location.href = "/app"}
          className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-100 transition-all duration-300"
        >
          Get Started
        </button>
      </section>
    </div>
  );
};

export default AboutPage;
