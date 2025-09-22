import { FaTwitter, FaLinkedin, FaGithub, FaEnvelope } from "react-icons/fa";

const ContactPage = () => {
  const socialLinks = [
    {
      icon: <FaTwitter />,
      label: "Twitter",
      url: "https://twitter.com/yourhandle",
      bg: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      icon: <FaLinkedin />,
      label: "LinkedIn",
      url: "https://linkedin.com/in/yourprofile",
      bg: "bg-purple-500 hover:bg-purple-600",
    },
    {
      icon: <FaGithub />,
      label: "GitHub",
      url: "https://github.com/yourrepo",
      bg: "bg-pink-500 hover:bg-pink-600",
    },
    {
      icon: <FaEnvelope />,
      label: "Email",
      url: "mailto:contact@architai.com",
      bg: "bg-indigo-400 hover:bg-indigo-500",
    },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Contact ArchitAI</h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto">
          Reach out to us through social media or email. We'd love to hear from you!
        </p>
      </section>

      {/* Social Links Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-gray-800">Connect with Us</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {socialLinks.map((s, idx) => (
              <a
                key={idx}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center space-x-3 px-6 py-4 rounded-xl text-white shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${s.bg}`}
              >
                <div className="text-2xl">{s.icon}</div>
                <span className="font-semibold">{s.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Map / Location Section */}
      <section className="py-24 bg-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-800">Our Location</h2>
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <a
            href="https://www.google.com/maps/place/Your+Company+Location"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full md:w-3/4 h-64 rounded-xl shadow-lg overflow-hidden border-4 border-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 hover:shadow-2xl transition-all duration-300"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.123456!2d-122.12345!3d37.12345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808f7e1a123456%3A0xabcdef123456!2sYour+Company+Location!5e0!3m2!1sen!2sin!4v1234567890"
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </a>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
