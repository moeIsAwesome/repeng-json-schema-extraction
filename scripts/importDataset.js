const mongoose = require("mongoose");
const fs = require("fs");

mongoose.set("strictQuery", false);

// MongoDB URI
const mongoURI =
  "mongodb://mongoadmin:secret@mongodb:27017/datasets?authSource=admin";

// Connect to MongoDB using the provided URI
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to insert JSON data into the specified collection with progress indicator
async function insertJsonToMongoDB(
  jsonFilePath,
  collectionName,
  progressCallback
) {
  try {
    console.log(
      `Start inserting data from file: ${jsonFilePath} into collection: ${collectionName}`
    );

    // Read the JSON file
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));

    // Set the model based on the collection name
    const DynamicModel = mongoose.model(
      collectionName,
      new mongoose.Schema({}, { strict: false })
    );

    // Hypothetical chunk size for progress reporting
    const chunkSize = 10; // You can adjust this based on your needs

    // Calculate the total number of chunks
    const totalChunks = Math.ceil(jsonData.length / chunkSize);

    // Calculate the number of chunks to update progress every 20%
    const chunksPer20Percent = Math.floor(totalChunks / 5);

    // Insert the JSON data into the specified collection with progress reporting
    for (let i = 0; i < totalChunks; i++) {
      const startIdx = i * chunkSize;
      const endIdx = (i + 1) * chunkSize;
      const chunkData = jsonData.slice(startIdx, endIdx);

      await DynamicModel.create(chunkData);

      // Update progress every 20%
      if ((i + 1) % chunksPer20Percent === 0) {
        const progress = ((i + 1) / totalChunks) * 100;
        progressCallback(progress, jsonFilePath);
      }
    }

    console.log(
      `Data inserted successfully into collection: ${collectionName} from file: ${jsonFilePath}`
    );
  } catch (error) {
    console.error(
      `Error inserting data into collection ${collectionName} from file: ${jsonFilePath}:`,
      error
    );
  }
}

// Example usage: Call the function sequentially with different file paths and table names
async function insertAllData() {
  const files = ["./datasets/drugs.json", "./datasets/companies.json", "./datasets/movies.json"];
  const collections = ["drugs", "companies", "movies"];

  const totalInsertions = files.length;
  let completedInsertions = 0;

  for (let i = 0; i < totalInsertions; i++) {
    const file = files[i];
    const collection = collections[i];

    // Define a progress callback function
    const progressCallback = (progress, fileName) => {
      console.log(`Loading...: ${progress.toFixed(2)}%`);
    };

    await insertJsonToMongoDB(file, collection, progressCallback);
    completedInsertions++;
  }

  // Close the MongoDB connection after all insertions are done
  mongoose.connection.close();
  console.log("All insertions completed. MongoDB connection closed.");
}

// Call the function to insert all data sequentially
insertAllData();
