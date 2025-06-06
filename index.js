import express, { response } from "express"
import dotenv from "dotenv"
import { getAccessToken } from "./lib/auth.js"
import { stkPush } from "./lib/stkPush.js"
import prisma from "./lib/db.js"

dotenv.config()

const app = express()
app.use(express.json())


// initiate -stk
app.post("/initiate", async (req, res) => {
    try {
        
        const {phoneNumber, amount, productName} = req.body;
        // Databse logic to store transaction details
        // TABLE: Transaction
        // Status be pending

        // initiateSTK Push
        // 1. Get access token
        const accessToken = await getAccessToken()

        // 2. Initiate Stk push
        const initiateStkResponse = await stkPush(accessToken, phoneNumber, amount, productName)


        

        
        res.json({
            success: true,
            initiateStkResponse
        })






    } catch (error) {

        res.status(500).json({
            success: false, 
            error: error.message || "Failed to get access tone"
        })
        
    }
})

// callback endpoint
app.post("/callback", async (req, res)=> {
    try {

        
        const {stkCallback} = req.body.Body;

        console.log(stkCallback)

        let status = null
        if (stkCallback.ResultCode === 0) {
            status = "SUCCESS"
        } else {
            status = "FAILED"
        }

        // Database Logic to update the transaction status.
        const dbdata = await prisma.transaction.update({
            where: {
                CheckoutRequestID: stkCallback.CheckoutRequestID
            }, 
            data: {
                status: status
            }
        })

        console.log(dbdata)


        res.json({status, stkCallback})



    } catch (error) {
        console.error(error)
        res.status(500).json({error: 'something went wrong'})
    }
})


app.listen(3000, () => console.log("sever started successfully!"))