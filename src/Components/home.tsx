import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mosaic } from "react-loading-indicators";
import Aurora from './Aurora';
import "@fontsource/orbitron/900.css"; // For ultra-bold look


interface MenuData {
  items: Array<{
    id: number;
    "Original Title": string;
    "Title": string;
    Price: number;
    Description: string;
    Ingredients: string[];
    Category: string[];
    "Allergy tags": string[];
    Image: string[];
  }>
}


interface FileUploadProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileUpload({ onFileChange }: FileUploadProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileChange(event); // Pass the event to the parent component
    }
  };

  return (
    <div className="flex items-center justify-center w-full">
      <label
        htmlFor="dropzone-file"
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-200 dark:hover:bg-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg
            className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            SVG, PNG, JPG or GIF (MAX. 800x400px)
          </p>
        </div>
        <input
          id="dropzone-file"
          type="file"
          className="hidden"
          onChange={handleChange}
        />
      </label>
    </div>
  );
}


const Home: React.FC = () => {
  const key = import.meta.env.VITE_API_KEY;
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleTranslateClick = async () => {
    if (!selectedFile) {
      alert("Please select a file");
      return;
    }

    setLoading(true);
    try {
      const base64Image = await convertFileToBase64(selectedFile);

      const prompt = `{
       "You are a food and language expert. You are given an image of a menu. You are tasked with extracting all menu items and their details from this image. "
       "Every menu item will have the following fields, either in the image or you need to come up with them: with two excluseive fields: Name and Price (they have to be strictly extracted from the image)"
      
       "1. Original Title, type: \"String\" This should be the original title of the dish from the image This needs to be strictly extracted from the image and not generated by you."
       "8. Allergy tags, type: \"array of strings\" This should be the allergy tags of the dish, search online for the allergy tags of the dish."
       "9. id, type: \"int\" each item has a unique id"

       "Do not skip any menu item under any condition."
       "If you need do not have enough information about a specific item from the menu, try predicting the information about the menu."

       "Warnings: if the image is not clear, and that is not possible to extract more than two Original Dish Title and Price, you need to return a warning message saying that the image is not clear and please provide a better image. "
      
       "your output should be an array of the menu items with the fields from the above. "
       "the following fields needs to be in english. if not already in english, translate them to english. : Dish Title, Description, Ingredients"
       "Return the results in a structured JSON format"
       "Exclude any unnecessary text or decorations."
       "here is the example of the output: "
       "{"
       "    \"items\": ["
       "        {"
       "            \"id\": 1,"
       "            \"Original Title\": \"Pizza Margherita\","
       "            \"Dish Title\": \"Margherita Pizza\","
       "            \"Price\": 10,"
       "            \"Description\": \"A classic pizza with tomato sauce, mozzarella, and basil.\","
       "            \"Ingredients\": [\"tomato sauce\", \"mozzarella\", \"basil\"],"
       "            \"Category\": [\"Main Courses\"],"
       "            \"Allergy tags\": [\"Gluten\", \"Lactose\"],"
       "            \"Image\": []"
       "        }"
       "    ]"
       "},"

       "{"
       "    \"items\": ["
       "        {"
       "            \"id\": 2,"
       "            \"Original Title\": \"Cavatelli\","
       "            \"Dish Title\": \"Cavatelli Pasta\","
       "            \"Price\": 25,"
       "            \"Description\": \"A traditional Italian handmade pasta served with a rich garlic-infused tomato sauce, fresh ricotta, and grated Parmesan, garnished with basil.\","
       "            \"Ingredients\": [\"Cavatelli pasta\", \"tomato sauce\", \"garlic\", \"ricotta\", \"Parmesan\", \"basil\"],"
       "            \"Category\": [\"Main Courses\"],"
       "            \"Allergy tags\": [\"Gluten\"],"
       "            \"Image\": []"
       "        }"
       "    ]"
       "},"
       "..."
      }`;

      let data;
      while (true) {
        try {
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${key}`,
              "HTTP-Referer": "https://menu-lens.vercel.app/",
              "X-Title": "Menu Lens",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              "model": "google/gemini-2.0-flash-lite-preview-02-05:free",
              "messages": [
                {
                  "role": "user",
                  "content": [
                    { "type": "text", "text": `${prompt}` },
                    { 
                      "type": "image_url",
                      "image_url": { "url": `data:image/jpeg;base64,${base64Image}` }
                    }
                  ]
                }
              ],
              "response_format": {
                "type": "json_schema",
                "json_schema": {
                  "name": "menu",
                  "strict": true,
                  "schema": {
                    "type": "object",
                    "properties": {
                      "items": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "id": {"type": "number"},
                            "Original Title": {"type": "string"},
                            "Title": {"type": "string"},
                            "Price": {"type": "number"},
                            "Description": {"type": "string"},
                            "Ingredients": {"type": "array", "items": {"type": "string"}},
                            "Category": {"type": "array", "items": {"type": "string"}},
                            "Allergy tags": {"type": "array", "items": {"type": "string"}},
                            "Image": {"type": "array", "items": {"type": "string"}}
                          },
                          "required": ["Original Title", "Price", "Description", "Ingredients", "Title", "Category", "Allergy tags", "Image"]
                        },
                        "description": "Array of menu items"
                      }
                    },
                    "required": ["items"],
                    "additionalProperties": false
                  }
                }
              }
            })
          });

          data = await response.json();
          if (data.choices?.[0]?.message?.content && data.choices[0].message.content !== null) break;
        } catch (error) {
          console.error("Error processing image, retrying...", error);
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      }

      setMenuData(data.choices[0].message.content);
      console.log(menuData);
      
    } catch (error) {
      console.error("Error processing image:", error);
      alert("处理失败");
    } finally {
      setLoading(false);
      // console.log(menuData);
      if (menuData === null) {
        alert("Model busy, please try again.");
      }
      if (menuData !== null) {
        
        navigate('/MM', { state: { menuData: menuData } });
      }
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result?.toString().split(',')[1];
        if (base64String) {
          resolve(base64String);
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleClosePreview = () => {
    setPreview(null);
    setSelectedFile(null);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-opacity-80 px-10 relative mx-auto min-w-screen">
      <div className="absolute top-0 left-0 w-full h-full" style={{ zIndex: -1 }}>
        <Aurora colorStops={["#f0b0ca", "#a89cdd", "#92a5f0"]} speed={0.5}/>
      </div>
      <div className="flex justify-center items-center h-screen">
        <div className="bg-transparent text-center gap-8">
        <h1
      style={{
        fontFamily: "Orbitron",
        fontWeight: 900,
        fontSize: "6rem",
        textAlign: "center",
        color: "#d8d2f0"
      }}
    >
      MenuLens
    </h1>
          <div className="mt-10 flex flex-col justify-center rounded-lg mx-4 rounded-xl">
            {loading ? (
              <div className="flex justify-center items-center">
                <Mosaic color={["#A3A4BC", "#7990A9", "#DABBAE", "#A3B7C3"]} size="medium" text="" textColor="" />
              </div>
            ) : (
              <>
                {!preview && <FileUpload onFileChange={handleFileChange} />}
                {preview && (
                  <div className="relative border-2 mx-auto pt-10 p-2 border-white border-opacity-5 bg-white bg-opacity-10 rounded-xl">
                    <img src={preview} alt="预览" className="w-64 h-64 mx-auto" />
                    <button
                      type="button"
                      onClick={handleClosePreview}
                      className="absolute top-0 right-0 mt-1 mr-1 bg-white bg-opacity-10 text-white rounded-xl px-2 py-1"
                    >
                      ↻ Back
                    </button>
                  </div>
                )}
                <div className="flex justify-center">
                  <button type="button" onClick={handleTranslateClick} className="mt-4 border-2 border-white border-opacity-5 bg-white bg-opacity-10 hover:bg-opacity-20 text-white font-bold py-2 px-4 rounded-2xl transition-all duration-300">
                    Translate
                  </button>
                  {/* <button type="button" onClick={() => navigate("/MM", { state: { menuData: menuData } })} className="mt-4 border-2 border-white border-opacity-5 bg-white bg-opacity-10 hover:bg-opacity-20 text-white font-bold py-2 px-4 rounded-2xl transition-all duration-300">
                    Save
                  </button> */}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 