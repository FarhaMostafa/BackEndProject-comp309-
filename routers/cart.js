const express = require("express");
const Cart = require("../models/cart");
const Item = require("../models/item");
const Auth = require("../middleware/auth");

const router = new express.Router();

//get cart items

router.get("/cart",Auth,async(req,res)=>{
    const owner=req.user._id;


try{
    const cart=await Cart.findOne({owner});
    if(cart&&cart.items.length>0){
        res.status(200).send(cart);
    }else{
        res.send(null);
    }
}catch(error){
    res.status(500).send();
}
});


//add cart

router.post("/cart",Auth,async(req,res)=>{
    const owner=req.user._id;
    const {itemId,quantity}=req.body;
    try {
        const cart=await Cart.findOne({owner});//get owner of the cart
        const item=await Item.findOne({_id:itemId});//get the item id
        //if the item not exit send to the user that the item not fount
        if(!item){
            res.status(404).send({message :"item not found"});
            return;
        }
        const price=item.price;
        const name=item.name;
        //if the cart is already exits for the user
        if(cart){
            const itemIndex=cart.items.findOne((item)=>item.itemId==itemId);
            //check if product exists or not
            if(itemIndex>-1){
                let product=cart.items[itemIndex];
                product.quantity+=quantity;
                //get the bill by useing the call back function 
                //reduce to sum all values in the array
                cart.bill=cart.items.reduce((acc,curr)=>{
                    return acc+curr.quantity*curr.price;
                },0)

                cart.items[itemIndex]=product;
                //save the cart in the mongoDB
                await cart.save();
                res.status(200).send(cart);
            }else{
                cart.items.push({itemId,name,quantity,price});
                cart.bill=cart.items.reduce((acc,curr)=>{
                    return acc+curr.quantity*curr.price;
                },0)
                await cart.save();
                res.status(200).send(cart);
            }
        }else{
            //no cart
            //then create new cart
            const newCart=await cart.create({
                owner,
                items:[{itemId,name,quantity,price}],
                bill:quantity*price,
            });
            return res.status(201).send(newCart);

        }
        
    } catch (error) {
          console.log(error);
    res.status(500).send("something went wrong");
  }

    
});

//delelte item from the card
router.delete("/cart",Auth,async(req,res)=>{
    const owner=req.user._id;
    const itemId=req.query.itemId;
    try {
        let cart=await Cart.findOne({owner});
        const itemIndex = cart.items.findIndex((item) => item.itemId == itemId);
        if(itemIndex>-1){
            let item = cart.items[itemIndex];  
            cart.bill-=item.quantity*item.price;
            if(cart.bill<0){
                cart.bill=0;
            }
            cart.items.splice(itemIndex,1);//delete item index 
            cart.bill=cart.items.reduce((acc,curr)=>{
                return acc+curr.quantity*curr.price;
            },0)
            cart = await cart.save();
            res.status(200).send(cart);
        }else{
            res.status(404).send("item not found");  
        }
       
        
    } catch (error) {
        res.status(400).send(); 
    }
});

module.exports = router;
