import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { LuSalad } from "react-icons/lu";
import { PiBowlFoodBold, PiCoffeeBold, PiCakeBold } from "react-icons/pi";
import { IoBookOutline } from "react-icons/io5";
import { GrSort } from "react-icons/gr";
import { CgShoppingCart } from "react-icons/cg";
import { MdOutlineSupportAgent } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import Aurora from './Aurora';

interface MenuItem {
  id: number;
  "Original Title": string;
  Title: string;
  Price: number;
  Description: string;
  Ingredients: string[];
  Category: string[];
  "Allergy tags": string[];
  Image: string[];
  quantity?: number;
}

interface MenuData {
  items: MenuItem[];
}

function Menu() {
  const location = useLocation();
  const [data, setData] = useState<string>(location.state?.menuData || "{}");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const apiKey = import.meta.env.VITE_PHOTO_API_KEY;
  const [itemImages, setItemImages] = useState<Record<number, string | null>>({});
  
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [cart, setCart] = useState<MenuItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isBotOpen, setIsBotOpen] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<string>("original");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAllergy, setSelectedAllergy] = useState<string>("");
  const [parsedData, setParsedData] = useState<MenuItem[]>([]);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };
  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
  };
  const handleClosePopup = () => {
    setSelectedItem(null);
  };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrder(e.target.value);
  };
  const handleAllergyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAllergy(e.target.value);
  };
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };
  const handleCheckout = () => {
    console.log("Checkout");
  };
  const toggleBot = () => {
    setIsBotOpen(!isBotOpen);
  };
  const incrementQuantity = () => {
    setQuantity(quantity + 1);
  };
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id ? { ...cartItem, quantity: (cartItem.quantity || 0) + quantity } : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity }]);
    }
    setQuantity(1);
    setSelectedItem(null);
  };

  async function fetchPixabayImages(query: string): Promise<string[]> {
    try {
      const res = await fetch(
        `https://pixabay.com/api/?key=${apiKey}&q=homemade+dish+${encodeURIComponent(query)}&image_type=photo`
      );
      const data = await res.json();
      return data.hits.length > 0 ? data.hits.map((hit: any) => hit.webformatURL) : [];
    } catch (error) {
      console.error("Error fetching images:", error);
      return [];
    }
  }

  const fetchMenuData = async () => {
    setData(location.state?.menuData || "{}");
    try {
      const parsedData = JSON.parse(data) as MenuData;
      setParsedData(parsedData['items']);
      
      // Fetch images for each menu item
      const imagePromises: Record<number, Promise<string[]>> = {};
      for (const item of parsedData['items']) {
        imagePromises[item.id] = fetchPixabayImages(item.Title);
      }
      
      // Resolve all promises and set images
      const images: Record<number, string | null> = {};
      for (const [id, promise] of Object.entries(imagePromises)) {
        const urls = await promise;
        images[Number(id)] = urls.length > 0 ? urls[0] : null;
      }
      
      setItemImages(images);
    } catch (error) {
      console.error("Error parsing menu data:", error);
    }
  };

  useEffect(() => {
    fetchMenuData();
    console.log(data);
  }, []);

  const filteredData = parsedData
    .filter(item => 
      item["Title"].toLowerCase().includes(searchQuery.toLowerCase()) &&
      (selectedAllergy === "" || !item["Allergy tags"].includes(selectedAllergy)) &&
      (selectedCategory === "All" || item["Category"].includes(selectedCategory))
    )
    .sort((a, b) => {
      if (sortOrder === "priceLowToHigh") {
        return a.Price - b.Price;
      } else if (sortOrder === "priceHighToLow") {
        return b.Price - a.Price;
      } else {
        return 0;
      }
    });

  return (
<div className="min-h-screen">
<div className="fixed top-0 left-0 w-full h-full" style={{ zIndex: -1, transform: 'scale(1)', transformOrigin: 'top left' }}>
  <Aurora colorStops={["#f0b0ca", "#a89cdd", "#92a5f0"]} speed={0.5}/>
</div>
            <div className="bg-gray-50/60 dark:bg-gray-800 shadow-lg">
        <header className="flex justify-between items-center px-6 py-4 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r text-white from-amber-500 to-orange-500 bg-clip-text text-transparent">
            Menu Lens
          </h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
            onClick={toggleCart}
          >
            <CgShoppingCart className="text-xl" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </motion.button>
        </header>

        {/* Menu Section */}
        <main className="p-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {["All", "Entrees", "Main Courses", "Drinks", "Desserts"].map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                className={`flex items-center px-4 py-2 rounded-full transition-colors ${
                  selectedCategory === category
                    ? "border-2 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                onClick={() => handleCategoryClick(category)}
              >
                {category === "All" && <IoBookOutline className="mr-2" />}
                {category === "Appetizer" && <LuSalad className="mr-2" />}
                {category === "Main" && <PiBowlFoodBold className="mr-2" />}
                {category === "Beverages" && <PiCoffeeBold className="mr-2" />}
                {category === "Dessert" && <PiCakeBold className="mr-2" />}
                {category.replace("Courses", "")}
              </motion.button>
            ))}
          </div>

          {/* Filters Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-white bg-transparent">
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 rounded-lg bg-transparent border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            
            <div className="flex items-center bg-gray-50/60 dark:bg-gray-700 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-600">
              <GrSort className="text-gray-400 mr-2" />
              <select
                value={sortOrder}
                onChange={handleSortChange}
                className="w-full bg-transparent text-white focus:outline-none"
              >
                <option value="original">Featured</option>
                <option value="priceLowToHigh">Price: Low to High</option>
                <option value="priceHighToLow">Price: High to Low</option>
              </select>
            </div>

            <div className="flex items-center bg-transparent rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-600">
              <label htmlFor="allergy-select" className="text-gray-400 mr-2">Allergy:</label>
              <select
                id="allergy-select"
                value={selectedAllergy}
                onChange={handleAllergyChange}
                className="w-full bg-transparent text-white focus:outline-none"
              >
                <option value="">None</option>
                <option value="Gluten">Gluten</option>
                <option value="Dairy">Dairy</option>
                <option value="Nuts">Nuts</option>
                <option value="Seafood">Seafood</option>
              </select>
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredData?.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
                className="bg-transparent rounded-xl shadow-sm hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 dark:border-gray-600"
                onClick={() => handleItemClick(item)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {item["Title"]}
                    </h3>
                    <span className="text-white font-bold">${item.Price}</span>
                  </div>
                  <p className="text-sm text-white mb-3">
                    {item["Original Title"]}
                  </p>
                  <div className="h-48 bg-transparent rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {itemImages[item.id] ? (
                      <img 
                        src={itemImages[item.id]!} 
                        alt={item.Title} 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-white">No image available</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item["Allergy tags"].map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs rounded-full bg-transparent text-white"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Item Details Modal */}
          <AnimatePresence>
            {selectedItem && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-50"
              >
                <motion.div
                  initial={{ y: 50 }}
                  animate={{ y: 0 }}
                  className="bg-gray-200 dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md relative"
                >
                  <button
                    onClick={handleClosePopup}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    ✕
                  </button>
                  <h3 className="text-2xl font-bold mb-4 text-black">
                    {selectedItem["Title"]}
                  </h3>
                  {itemImages[selectedItem.id] && (
                    <div className="h-48 rounded-lg mb-4 overflow-hidden">
                      <img 
                        src={itemImages[selectedItem.id]!} 
                        alt={selectedItem.Title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-4">
                    <p className="text-black">
                      {selectedItem.Description}
                    </p>
                    <div className="bg-transparent p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-black">
                        Ingredients
                      </h4>
                      <p className="text-black">
                        {selectedItem.Ingredients.join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={decrementQuantity}
                          className="w-8 h-8 rounded-lg bg-transparent border border-black flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="text-xl font-medium">{quantity}</span>
                        <button
                          onClick={incrementQuantity}
                          className="w-8 h-8 rounded-lg bg-transparent border border-black flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => addToCart(selectedItem)}
                        className="px-6 py-2 bg-transparent border border-black hover:bg-amber-600 text-black rounded-lg transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Cart Sidebar */}
        <motion.div
          initial={false}
          animate={isCartOpen ? "open" : "closed"}
          variants={{
            open: { x: 0 },
            closed: { x: "100%" },
          }}
          className="fixed top-0 right-0 h-full w-full md:w-96 bg-gray-50/60 dark:bg-gray-800 shadow-xl z-50 border-l border-gray-200 dark:border-gray-700"
        >
          <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Your Cart</h2>
              <button
                onClick={toggleCart}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                Your cart is empty
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto">
                  {cart.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium text-gray-800 dark:text-gray-100">
                          {item["Title"]}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.quantity} x ${item.Price.toFixed(2)}
                        </p>
                      </div>
                      <span className="font-medium text-amber-500">
                        ${((item.Price * (item.quantity || 0))).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-gray-800 dark:text-gray-100">Total:</span>
                    <span className="text-xl font-bold text-amber-500">
                      ${cart.reduce((total, item) => total + item.Price * (item.quantity || 0), 0).toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Support Bot */}
        <div className="fixed bottom-6 right-6 z-50">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 bg-amber-500 text-white rounded-full shadow-lg"
            onClick={toggleBot}
          >
            <MdOutlineSupportAgent className="text-2xl" />
          </motion.button>

          <AnimatePresence>
            {isBotOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-20 right-0 w-80 bg-gray-50/60 dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700"
              >
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default Menu; 