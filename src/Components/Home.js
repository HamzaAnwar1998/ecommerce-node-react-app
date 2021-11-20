import React,{useState, useEffect} from 'react'
import { Navbar } from './Navbar'
import { Products } from './Products'
import {auth,fs} from '../Config/Config'

export const Home = (props) => {

    // getting current user uid
    function GetUserUid(){
        const [uid, setUid]=useState(null);
        useEffect(()=>{
            auth.onAuthStateChanged(user=>{
                if(user){
                    setUid(user.uid);
                }
            })
        },[])
        return uid;
    }

    const uid = GetUserUid();

    // getting current user function
    function GetCurrentUser(){
        const [user, setUser]=useState(null);
        useEffect(()=>{
            auth.onAuthStateChanged(user=>{
                if(user){
                    fs.collection('users').doc(user.uid).get().then(snapshot=>{
                        setUser(snapshot.data().FullName);
                    })
                }
                else{
                    setUser(null);
                }
            })
        },[])
        return user;
    }

    const user = GetCurrentUser();
    // console.log(user);
    
    // state of products
    const [products, setProducts]=useState([]);
    
    // state of category
    const [category, setCategory]=useState('Electronic Devices');

    // getting products function
    const getProducts = async ()=>{
        const products = await fs.collection('Products').where('category','==',category).get();
        const productsArray = [];
        for (var snap of products.docs){
            var data = snap.data();
            data.ID = snap.id;
            productsArray.push({
                ...data
            })
            if(productsArray.length === products.docs.length){
                setProducts(productsArray);
            }
        }
    }

    useEffect(()=>{
        getProducts();
    },[category])

    // state of totalProducts
    const [totalProducts, setTotalProducts]=useState(0);
    // getting cart products   
    useEffect(()=>{        
        auth.onAuthStateChanged(user=>{
            if(user){
                fs.collection('Cart ' + user.uid).onSnapshot(snapshot=>{
                    const qty = snapshot.docs.length;
                    setTotalProducts(qty);
                })
            }
        })       
    },[])  

    // globl variable
    let Product;

    // add to cart
    const addToCart = (product)=>{
        if(uid!==null){
            // console.log(product);
            Product=product;
            Product['qty']=1;
            Product['TotalProductPrice']=Product.qty*Product.price;
            fs.collection('Cart ' + uid).doc(product.ID).set(Product).then(()=>{
                console.log('successfully added to cart');
            })

        }
        else{
            props.history.push('/login');
        }
        
    }
     
    const handleCategory=(e)=>{
        setCategory(e.currentTarget.id);
        document.getElementById(category).classList.toggle('active');                     
    }
    
    return (
        <>
            <Navbar user={user} totalProducts={totalProducts}/>           
            <br></br>
            {products.length > 0 && (
                <>
                    <div className='container-fluid filter-products-main-box'>
                        <div className='filter-box'>
                            <h6>Filter by category</h6>                        
                            <span onClick={handleCategory} 
                            id="Electronic Devices" data-id="Electronic Devices">Electronic Devices</span>
                            <span onClick={handleCategory}
                            id="Mobile Accessories" data-id="Mobile Accessories">Mobile Accessories</span>
                            <span onClick={handleCategory}
                            id="TV & Home Appliances" data-id="TV & Home Appliances">TV & Home Appliances</span>
                            <span onClick={handleCategory}
                            id="Sports & outdoors" data-id="Sports & outdoors">Sports & outdoors</span>
                            <span onClick={handleCategory}
                            id="Health & Beauty" data-id="Health & Beauty">Health & Beauty</span>
                            <span onClick={handleCategory}
                            id="Home & Lifestyle" data-id="Home & Lifestyle">Home & Lifestyle</span>
                            <span onClick={handleCategory}
                            id="Men's Fashion" data-id="Men's Fashion">Men's Fashion</span>
                            <span onClick={handleCategory}
                            id="Watches, bags & Jewellery" data-id="Watches, bags & Jewellery">Watches, bags & Jewellery</span>
                            <span onClick={handleCategory}
                            id="Groceries" data-id="Groceries">Groceries</span>
                        </div>                 
                      
                        <div className='my-products'>
                            <h1 className='text-center'>{category}</h1>
                            <div className='products-box'>
                                <Products products={products} addToCart={addToCart}/>
                            </div>
                        </div>

                    </div>                    
                </>
            )}
            {products.length < 1 && (
                <div className='container-fluid'>Please wait....</div>
            )}
        </>
    )
}
