const express = require('express')
const Item = require('../models/item')
const AuthAdmin = require('../middleware/authAdmin')


const router = new express.Router()

//fetch all items
router.get('/items', async(req, res) => {
    try {
        const items = await Item.find({})
        res.status(200).send(items)
    } catch (error) {
        res.status(400).send(error)
    }
})

//fetch an item
router.get('/items/:id', async(req, res) => {
    try{
        const item = await Item.findOne({_id: req.params.id})
        if(!item) {
            res.status(404).send({error: "Item not found"})
        }
        res.status(200).send(item) 
    } catch (error) {
        res.status(400).send(error)
    }
})

//create an item
router.post('/items',AuthAdmin, async(req, res) => {
    try {
        const newItem = new Item({
            ...req.body,
            owner: req.user._id
        })
        await newItem.save()
        res.status(201).send(newItem)
    } catch (error) {
        console.log({error})
        res.status(400).send({message: "error"})
    }
})

//update an item

router.patch('/items/:id', AuthAdmin, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'description', 'category', 'price']

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) {
        return res.status(400).send({ error: 'invalid updates'})
    }

    try {
        const item = await Item.findOne({ _id: req.params.id})
    
        if(!item){
            return res.status(404).send()
        }

        updates.forEach((update) => item[update] = req.body[update])
        await item.save()
        res.send(item)
    } catch (error) {
        res.status(400).send(error)
    }
})

//delete item
router.delete('/items/:id', AuthAdmin, async(req, res) => {
    try {
        const deletedItem = await Item.findOneAndDelete( {_id: req.params.id} )
        if(!deletedItem) {
            res.status(404).send({error: "Item not found"})
        }
        res.send(deletedItem)
    } catch (error) {
        res.status(400).send(error)
    }
})
////search 
const searchItem = async(req,res)=>{
    try{

     var search = req.body.search;
     var item_data = await Item.find({"name":{$regex:".*"+search+".*",$options:'i'}});
     if(item_data.length>0){
        res.status(200).send({ success:true,msg:"Item Details",data:item_data});
     }else{
        res.status(200).send({success:true,msg:"item not found!"});
     }

    } catch(error){
        res.status(400).send({success:false,msg:error.message});
    }
}

router.get('/item/:name',searchItem);

module.exports = router