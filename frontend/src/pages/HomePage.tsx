import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Guided AI Conversation",
      description: "Step-by-step AI guidance helps you design complex systems effortlessly.",
      icon: (
        <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 1 0-18 0 9 9 0 0 0 18 0z"/>
        </svg>
      ),
    },
    {
      title: "Instant Diagrams",
      description: "Generate professional system design diagrams instantly.",
      icon: (
        <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m2 8H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5l2 2h5a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2z"/>
        </svg>
      ),
    },
    {
      title: "Save & Revisit",
      description: "All sessions are saved so you can revisit or continue anytime.",
      icon: (
        <svg className="w-10 h-10 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18"/>
        </svg>
      ),
    },
  ];

  const steps = [
    {
      title: "1. Enter Your Idea",
      description: "Start with a system or product idea in the input box.",
    },
    {
      title: "2. Answer AI Questions",
      description: "ArchitAI will guide you with smart questions for clarity.",
    },
    {
      title: "3. Receive Diagram",
      description: "Get a polished system design diagram ready to download.",
    },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 via-purple-100 to-pink-200">
            ArchitAI
          </h1>
          <p className="mt-4 text-lg md:text-2xl max-w-2xl mx-auto">
            Generate professional system design diagrams through guided AI conversations.
          </p>
          <button
            onClick={() => navigate("/app")}
            className="mt-8 px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-100 transition-all duration-300"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {features.map((f, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg p-8 text-center hover:scale-105 transform transition-all duration-300">
                <div className="flex justify-center mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((s, idx) => (
              <div key={idx} className="p-6 border-l-4 border-indigo-500 rounded-lg hover:shadow-lg transition-all duration-300">
                <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-gray-600">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Diagram Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Example Diagram</h2>
          <div className="overflow-hidden rounded-xl shadow-lg">
            <img
              src="https://via.placeholder.com/800x450.png?text=Sample+System+Diagram"
              alt="Sample Diagram"
              className="w-full object-cover hover:scale-105 transform transition-all duration-300"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start designing?</h2>
        <button
          onClick={() => navigate("/app")}
          className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-100 transition-all duration-300"
        >
          Get Started
        </button>
      </section>
    </div>
  );
};

export default HomePage;
