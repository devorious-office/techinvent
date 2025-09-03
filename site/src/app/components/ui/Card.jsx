const Card = ({ title, children }) => {
  return (
    <div className="bg-gray-800/80 border border-gray-700 rounded-lg p-6 mb-8 shadow-lg backdrop-blur-sm">
      <h3 className="text-2xl font-semibold text-cyan-400 border-b-2 border-cyan-500/30 pb-3 mb-6">
        {title}
      </h3>
      {children}
    </div>
  );
};

export default Card;