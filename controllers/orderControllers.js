const Order = require('../models/order');
const Cart = require('../models/cart');
const User = require('../models/user');
const config = require('../config/default');
const stripe = require('stripe')
//(config.get('StripeAPIKey'));

module.exports.get_orders = async (req,res) => {
    //const userId = req.params.id;
    const owner=req.user._id;
    Order.find({owner}).sort({date:-1}).then(orders => res.json(orders));
}

module.exports.checkout = async (req,res) => {
    try{
        const userId = req.params.id;
        const owner=req.user._id;
        const {source} = req.body;
        let cart = await Cart.findOne({owner});
        let user = await User.findOne({_id: userId});
        const email = user.email;
        if(cart){
            //strip is library
            const charge = await stripe.charges.create({
                amount: cart.bill,
                currency: 'inr',
                source: source,
                receipt_email: email
            })
            if(!charge) throw Error('Payment failed');
            
            if(charge){
                const order = await Order.create({
                    userId,
                    items: cart.items,
                    bill: cart.bill
                });
                const data = await Cart.findByIdAndDelete({_id:cart.id});
                return res.status(201).send(order);
            }
        }
        else{
            res.status(500).send("You do not have items in cart");
        }
    }
    catch(err){
        console.log(err);
        res.status(500).send("Something went wrong");
    }
}