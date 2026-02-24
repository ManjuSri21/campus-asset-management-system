FRONTEND FULL CODE (React + Material UI)
Step 1: Create React App

Go to main folder:

cd ..
npx create-react-app frontend
cd frontend


Install dependencies:

npm install axios react-router-dom
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material


CSS :
  background: linear-gradient(135deg, #f48fb1, #d81b60, #6a1b9a);

username : admin
password : admin123

Backend setup : 

cd backend
npm init -y
Install dependencies:

npm install express mongoose cors dotenv bcryptjs jsonwebtoken
npm install nodemon --save-dev

To start backend : 
cd backend 
nodemon server.js