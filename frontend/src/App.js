import React, { useState } from "react";
import axios from "axios";
import { Camera, Upload, Book, Shirt, Palette, Sun, ChevronRight } from "lucide-react";

const Spinner = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
);

const ColorCard = ({ color, meaning, onClick }) => (
  <div
    className="bg-white rounded-xl shadow-lg p-4 cursor-pointer transform hover:scale-105 transition duration-300 flex flex-col items-center"
    onClick={() => onClick(color)}
  >
    <div
      className="w-20 h-20 rounded-full mb-4 border-4 border-white shadow-inner"
      style={{ backgroundColor: color }}
    ></div>
    <p className="text-sm text-gray-600 text-center font-georgia">{meaning}</p>
  </div>
);

const ProductCard = ({ url, alt }) => (
  <div className="group relative overflow-hidden rounded-xl shadow-lg transform hover:scale-105 transition duration-300">
    <img src={url} alt={alt} className="w-full h-64 object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
      <div className="p-4 w-full">
        <h4 className="font-georgia font-semibold text-white mb-2 truncate">{alt}</h4>
        <button className="bg-white text-gray-800 px-4 py-2 rounded-full hover:bg-gray-200 transition duration-300 text-sm font-medium font-georgia">
          View Details
        </button>
      </div>
    </div>
  </div>
);

export default function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState([]);
  const [skinTone, setSkinTone] = useState(null);
  const [colorRecommendation, setColorRecommendation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [gender, setGender] = useState(null);
  const [showColorModal, setShowColorModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState("");

  const PEXELS_API_KEY = "pGWgqahVrcprpx2XmPB4K8lrs9onLLjwBYRdusShqrglMavLjNpYtEIH";

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleGenderSelect = (selectedGender) => {
    setGender(selectedGender);
    setShowGenderModal(false);
    processImage(selectedFile, selectedGender);
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage("Please select a file first.");
      return;
    }
    setShowGenderModal(true);
  };

  const extractColorsFromString = (colorRecommendation) => {
    const regex = /#([0-9A-Fa-f]{6})/g;
    return colorRecommendation.match(regex) || [];
  };

  const processImage = async (file, selectedGender) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("gender", selectedGender);

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.message && response.data.skinTone) {
        setMessage(response.data.message);
        setSkinTone(response.data.skinTone);
        const colorsArray = extractColorsFromString(response.data.color_recommendation);
        setColorRecommendation(colorsArray);
        fetchOutfitSuggestions(colorsArray[0], selectedGender);
      } else {
        throw new Error("Unexpected response format from the server");
      }
    } catch (error) {
      console.error("There was an error uploading the file!", error);
      setError("Error uploading file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOutfitSuggestions = async (colorRecommendation, selectedGender) => {
    try {
      const response = await axios.get("https://api.pexels.com/v1/search", {
        headers: { Authorization: PEXELS_API_KEY },
        params: {
          query: `${selectedGender} outfit ${colorRecommendation}`,
          per_page: 6,
        },
      });

      setProducts(response.data.photos.map((photo) => ({
        url: photo.src.medium,
        alt: photo.alt,
      })));
    } catch (error) {
      console.error("Error fetching outfit suggestions", error);
      setError("Error fetching outfit suggestions. Please try again.");
    }
  };

  const handleColorClick = (color) => {
    setSelectedColor(color);
    setShowColorModal(true);
  };

  const colorMeanings = {
    "#FF5733": "Orange represents creativity, enthusiasm, and adventure.",
    "#33FF57": "Green symbolizes growth, harmony, balance, and nature.",
    "#3357FF": "Blue conveys tranquility, stability, trust, and confidence.",
    "#FF33F1": "Pink signifies love, femininity, compassion, and nurturing.",
    "#FFFF33": "Yellow embodies optimism, clarity, warmth, and energy.",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 font-georgia">
      {/* Navbar */}
      <nav className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg fixed w-full z-10 shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">
              CereStyle
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 pt-32 pb-20">
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-gray-800 leading-tight">
            Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">Perfect Style</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Upload your photo and let our AI analyze your unique features to provide personalized style recommendations.
          </p>
        </div>

        {/* Image Upload Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 mb-20 transform hover:scale-105 transition duration-500 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center justify-center">
            <Camera className="mr-3 text-indigo-600" size={32} /> Capture Your Style
          </h2>
          <form onSubmit={handleUpload} className="space-y-8">
            <div className="flex items-center justify-center w-full">
              <label htmlFor="photo-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-indigo-300 border-dashed rounded-2xl cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition duration-300">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 mb-4 text-indigo-500" />
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 800x400px)</p>
                </div>
                <input id="photo-upload" type="file" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 text-white py-4 px-8 rounded-full text-lg font-semibold hover:from-indigo-700 hover:to-pink-700 transition duration-300 flex items-center justify-center shadow-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner />
                  <span className="ml-3">Analyzing Your Style...</span>
                </>
              ) : (
                <>
                  <Palette className="mr-3" size={24} />
                  Reveal Your Style Palette
                </>
              )}
            </button>
          </form>

          {imagePreview && (
            <div className="mt-8">
              <img src={imagePreview} alt="Uploaded Preview" className="max-w-full h-auto rounded-2xl shadow-lg mx-auto" />
            </div>
          )}

          {message && (
            <div className="mt-8 p-6 bg-indigo-100 text-indigo-700 rounded-2xl">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-8 p-6 bg-red-100 text-red-700 rounded-2xl">
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {/* Skin Tone Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 transform hover:scale-105 transition duration-300">
            <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
              <Sun className="mr-3 text-yellow-500" size={28} /> Your Radiant Tone
            </h3>
            {loading ? (
              <div className="flex justify-center">
                <Spinner />
              </div>
            ) : skinTone && (
              <div className="relative">
                <div
                  className="w-full h-48 rounded-2xl shadow-inner"
                  style={{ backgroundColor: skinTone }}
                ></div>
                <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  {skinTone}
                </div>
              </div>
            )}
          </div>

          {/* Color Theory Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 transform hover:scale-105 transition duration-300">
            <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
              <Book className="mr-3 text-blue-500" size={28} /> Your Color Story
            </h3>
            <div className="grid grid-cols-2 gap-6">
              {colorRecommendation.map((color, index) => (
                <ColorCard
                  key={index}
                  color={color}
                  meaning={colorMeanings[color] || "Discover the meaning of this color."}
                  onClick={handleColorClick}
                />
              ))}
            </div>
          </div>

          {/* Outfit Suggestions Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 transform hover:scale-105 transition duration-300">
            <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-800">
              <Shirt className="mr-3 text-green-500" size={28} /> Style Inspirations
            </h3>
            {loading ? (
              <div className="flex justify-center">
                <Spinner />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {products.map((product, index) => (
                  <ProductCard key={index} url={product.url} alt={product.alt} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gender Selection Modal */}
      {showGenderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-12 rounded-3xl shadow-2xl max-w-md w-full">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Choose Your Style Path</h2>
            <div className="flex justify-center space-x-8">
              <button
                onClick={() => handleGenderSelect("male")}
                className="bg-indigo-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-indigo-600 transition duration-300 flex items-center shadow-lg"
              >
                <span className="mr-2 text-2xl">♂</span> Masculine
              </button>
              <button
                onClick={() => handleGenderSelect("female")}
                className="bg-pink-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-pink-600 transition duration-300 flex items-center shadow-lg"
              >
                <span className="mr-2 text-2xl">♀</span> Feminine
              </button>
            </div>
          </div>
        </div>
      )}
{/* Color View Modal */}
{showColorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-12 rounded-3xl shadow-2xl max-w-md w-full">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Color Insight</h2>
            <div
              className="w-48 h-48 rounded-full mx-auto mb-8 shadow-lg"
              style={{ backgroundColor: selectedColor }}
            ></div>
            <p className="text-center text-gray-600 mb-8 text-lg">
              {colorMeanings[selectedColor] || "Explore the unique qualities of this color in your style journey."}
            </p>
            <button
              onClick={() => setShowColorModal(false)}
              className="w-full bg-gradient-to-r from-indigo-600 to-pink-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:from-indigo-700 hover:to-pink-700 transition duration-300 shadow-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg py-12 mt-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-between items-center">
            <div className="w-full md:w-1/3 text-center md:text-left mb-6 md:mb-0">
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">
                CereStyle
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Discover your unique style with AI
              </p>
            </div>
            <div className="w-full md:w-1/3 text-center mb-6 md:mb-0">
              <p className="text-sm text-gray-600">
                &copy; 2023 CereStyle. All rights reserved.
              </p>
            </div>
            <div className="w-full md:w-1/3 text-center md:text-right">
              <div className="flex justify-center md:justify-end space-x-4">
                <a href="#" className="text-gray-400 hover:text-indigo-600 transition duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-indigo-600 transition duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-indigo-600 transition duration-300">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
