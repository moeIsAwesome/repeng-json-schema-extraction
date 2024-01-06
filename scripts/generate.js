const http = require('http');
const fs = require('fs');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

//Check if the results of the previous run exist and delete them
mongoose.set('strictQuery', false);
mongoose.connect(
  'mongodb://mongoadmin:secret@mongodb:27017/jsonschemadiscovery?authSource=admin',
  {
    useNewUrlParser: true,
  }
);
const connection = mongoose.connection;

connection.once('open', function () {
  // Check if the database exists
  connection.db.admin().listDatabases(function (err, result) {
    if (err) {
      console.error('Error checking database existence:', err);
      connection.close();
    } else {
      const databaseName = 'jsonschemadiscovery';

      if (result.databases.some((db) => db.name === databaseName)) {
        // Database exists, delete it
        console.log(
          'Cleaning up and checking for the results of the previous run...'
        );
        connection.db.dropDatabase(function (err) {
          if (err) {
            console.error('Error deleting database:', err);
          } else {
            console.log(
              'Starting the process... This may take a while. Please wait...'
            );
          }
          // Close the connection after deleting the database
          connection.close();
        });
      } else {
        connection.close();
      }
    }
  });
});

const userInitCredentials = {
  username: 'moe',
  email: 'moe@mousavi.com',
  password: '12345',
  userId: '',
};

// Function to create a user
function createUser(callback) {
  const userCredentials = {
    username: userInitCredentials.username,
    email: userInitCredentials.email,
    password: userInitCredentials.password,
  };

  const postData = JSON.stringify(userCredentials);

  const options = {
    hostname: 'localhost',
    port: 3000, // Replace with the actual port
    path: '/api/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length,
    },
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        const response = JSON.parse(data);
        userInitCredentials.userId = response._id; // Extract _id from the response
        callback(null, true);
      } else {
        const error = new Error(
          `Error creating user. Status code: ${res.statusCode}`
        );
        callback(error, false);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error creating user:', error.message);
    callback(error, false);
  });

  req.write(postData);
  req.end();
}

// Function to login and get the token
function loginUser(callback) {
  const userCredentials = {
    email: userInitCredentials.email,
    password: userInitCredentials.password,
  };

  const postData = JSON.stringify(userCredentials);

  const options = {
    hostname: 'localhost',
    port: 3000, // Replace with the actual port
    path: '/api/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length,
    },
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        const response = JSON.parse(data);
        const token = response.token;
        console.log('Successful authentication! Please wait...');
        callback(null, token);
      } else {
        console.error('Error logging in. Status code:', res.statusCode);
        callback(
          new Error(`Error logging in. Status code: ${res.statusCode}`),
          null
        );
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error logging in:', error.message);
    callback(error, null);
  });

  req.write(postData);
  req.end();
}

let batchId;

// Function to perform the discovery request (modified for async/await)
function discoveryAsync(databaseParam, token, step, totalSteps) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(databaseParam);

    const options = {
      hostname: 'localhost',
      port: 3000, // Replace with the actual port
      path: '/api/batch/rawschema/steps/all',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        Authorization: `Bearer ${token}`,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log(
            `Step: ${step}/${totalSteps} | Discovery for collection ${databaseParam.collectionName} successful!`
          );
          batchId = response.batchId;

          resolve(response);
        } else {
          console.error(
            `Error in discovery for collection: ${databaseParam.collectionName}. Status code: ${res.statusCode}`
          );
          reject(
            new Error(
              `Error in discovery for collection: ${databaseParam.collectionName}. Status code: ${res.statusCode}`
            )
          );
        }
      });
    });

    req.on('error', (error) => {
      console.error(
        `Error in discovery for collection: ${databaseParam.collectionName}:`,
        error.message
      );
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Modify the countDocuments function to return count and collectionName
async function countDocuments(collectionName, databaseName) {
  const uri = 'mongodb://mongoadmin:secret@mongodb:27017/';
  const dbName = databaseName;

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();

    const db = client.db(dbName);

    const collection = db.collection(collectionName);
    const count = await collection.countDocuments();
    return { collectionName, count }; // Return an object with collectionName and count
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

// Usage
createUser((error, success) => {
  if (!error && success) {
    loginUser(async (loginError, token) => {
      if (!loginError && token) {
        const collections = ['drugs', 'companies', 'movies'];
        let completedRequests = 0;

        // Array to store results
        const resultsArray = [];

        for (let index = 0; index < collections.length; index++) {
          const collection = collections[index];
          const databaseParam = {
            address: 'mongodb',
            port: '27017',
            userId: userInitCredentials.userId,
            databaseName: 'datasets',
            collectionName: collection,
            rawSchemaFormat: false,
            authentication: {
              authDatabase: 'admin',
              userName: 'mongoadmin',
              password: 'secret',
              authMechanism: 'SCRAM-SHA-1',
            },
          };

          try {
            const result = await discoveryAsync(
              databaseParam,
              token,
              index + 1,
              collections.length
            );

            // Collect the results
            completedRequests++;

            // Count documents and add to resultsArray
            const orderedResultsCount = await countDocuments(
              `rawschemaordered${batchId}results`,
              'jsonschemadiscovery'
            );

            const unorderedResultsCount = await countDocuments(
              `rawschemaunordered${batchId}results`,
              'jsonschemadiscovery'
            );

            const numb = await countDocuments(
              result.collectionName,
              'datasets'
            );
            resultsArray.push({
              name: numb.collectionName,
              NJSON: numb.count,
              RS: unorderedResultsCount.count,
              ROrd: orderedResultsCount.count,
            });
          } catch (error) {
            console.log('Error in discovery request:', error.message);
          }
        }

        if (completedRequests === collections.length) {
          const hardCodedRS = {
            drugs: { N_JSON: '3662', RS: '2818', ROrd: '2818' },
            companies: { N_JSON: '24367', RS: '21312', ROrd: '21312' },
            movies: { N_JSON: '30330', RS: '25140', ROrd: '25140' },
          };

          const tableContent = `
\\begin{table}[ht]
  \\centering
  \\caption{Comparison with Frozza et al. ~\\cite{frozza2018approach}}
  \\vspace{-10pt}
  \\label{tab:example}
  \\resizebox{0.5\\textwidth}{!}{
    \\begin{tabular}{|c|c|c|c|c|c|c|}
      \\hline
      \\ {Datasets} & \\multicolumn{3}{|c|}{RepEng} & \\multicolumn{3}{|c|}{Frozza et al. ~\\cite{frozza2018approach}}\\\\
      \\hline
      Collection & N\\char\`_JSON & RS & ROrd & N\\char\`_JSON & RS & ROrd \\\\
      \\hline
      ${resultsArray
        .map(
          (item) =>
            `${item.name} & ${item.NJSON} & ${item.RS} & ${item.ROrd} & ${
              hardCodedRS[item.name].N_JSON
            } & ${hardCodedRS[item.name].RS} & ${
              hardCodedRS[item.name].ROrd
            }   \\\\ \\hline`
        )
        .join('\n')}
    \\end{tabular}
  }
  \\smallskip
  \\vspace{1pt}
  \\parbox{0.5\\textwidth}{%
    \\centering
    \\raggedright
    \\footnotesize
    N JSON - Number of JSON documents. RS - Raw schemas. ROrd - Raw schemas with ordered structure.
  }
  \\label{table2}
\\end{table}
`;

          fs.writeFileSync(
            '../../report/report_template/repeng-json-schema-extraction-report/dynamicTable.tex',
            tableContent
          );

          console.log(
            'All discovery requests completed. Results written to table.tex'
          );
        }
      }
    });
  }
});
