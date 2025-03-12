import express from 'express'
import cors from 'cors'
import dotenv from "dotenv";
import connectOffChainDb from './config/database.config.js'



const app = express()
dotenv.config();
app.use(cors())
app.use(express.json())

connectOffChainDb()


export default app