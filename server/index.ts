import express from "express"
import "./db/connection"
import path from 'path'
import {productRouter} from'./routers/productRouter'
import {invoiceRouter} from'./routers/invoiceRouter'
import expressLayouts from 'express-ejs-layouts'
import {productModel} from './model/product'
import {invoiceModel} from './model/invoice'

const app = express();
app.use(express.json())
const port = process.env.PORT || 3000;
app.use(expressLayouts)
app.use(express.static(path.join(__dirname, '../public')));
app.set('view engine', 'ejs');
app.use(productRouter)
app.use(invoiceRouter)

app.set('views',path.join(__dirname,'../views'))

app.get('',async (req, res) => {
    const invoices = await invoiceModel.find({})
    res.render('index.ejs', {invoices});
});

app.get('/admin', async(req, res) => {
    const products = await productModel.find({}).sort({name:1})
    console.log(products);
    
    res.render('admin',{products});
})
app.get('/addinvoice', async(req, res) => {
    const products = await productModel.find({}).sort({name:1})
    res.render('addinvoice',{products});
})

app.get('/editinvoice', async(req, res) => {
    const _id = req.query._id
    try{
    const invoice = await invoiceModel.findById({_id}).populate('items').exec()
    if(!invoice)
        return res.send('<h1>404 Page Not found</h1>')
    const products = await productModel.find({}).sort({name:1})
    res.render('editinvoice',{products,invoice});
    }catch(e){
        console.log(e.message);
        
        return res.send('<h1>404 Page Not found</h1>')
    }
})

app.get('/show',(req,res)=>{
    console.log(req.query.company);
    res.render('show',{
        _id:req.query._id,
        company:req.query.company,
        contragent: req.query.contragent,
        amount : req.query.amount,
        data:req.query.data
    })
})

app.get('/stock',async(req,res)=>{
    
    const products = await productModel.find({}).sort({name:1})
    console.log(products)
    res.render('stock',{products}) 
})
app.get('/overview',async(req,res)=>{
    
    let products: any = await productModel.find({}).sort({name:1})
    products = convert(products)
    console.log('products are' + JSON.stringify(products))
    res.render('overview',{products}) 
})



const convert = (data: any) => {

let names: any = []
let mapped= []
for (const index of data) {
  if (!names.includes(index.name)) {
    names.push(index.name);
    mapped.push({ name: index.name , quantity: 0});
  }
  let objIndex = mapped.findIndex(i=> i.name === index.name)
  mapped[objIndex].quantity =  index.quantity + mapped[objIndex].quantity
}

console.log(JSON.stringify(mapped))
return mapped
}
    

app.listen(port,()=>{
    console.log('server running');
    
})