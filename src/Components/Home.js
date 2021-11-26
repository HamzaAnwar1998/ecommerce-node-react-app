import React,{useState, useEffect} from 'react'
import { Navbar } from './Navbar'
import { Products } from './Products'
import {auth,fs} from '../Config/Config'
import { IndividualFilteredProduct } from './IndividualFilteredProduct'

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
    
    // state of products
    const [products, setProducts]=useState([]);

    // getting products function
    // const getProducts = async ()=>{        
    //     const products = await fs.collection('Products').where('category','==',category).get();        
    //     const productsArray = [];        
    //     if(products.docs.length>=1){
    //         for (var snap of products.docs){
    //             var data = snap.data();                                              
    //             data.ID = snap.id;
    //             productsArray.push({
    //                 ...data
    //             })
    //             if(productsArray.length === products.docs.length){
    //                 setProducts(productsArray);
    //             }                                    
    //         }
    //     }
    //     else{
    //         setProducts([]);
    //     }       
    // }

    // useEffect(()=>{
    //     getProducts();
    // },[category])

    // getting products function
    const getProducts = async ()=>{      
        const products = await fs.collection('Products').get();        
        const productsArray = [];        
        if(products.docs.length>=1){
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
        else{
            setProducts([]);
        }       
    }

    useEffect(()=>{
        getProducts();
    },[])

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

    // categories list rendering using span tag
    const [spans]=useState([
        {id: 'ElectronicDevices', text: 'Electronic Devices'},
        {id: 'MobileAccessories', text: 'Mobile Accessories'},
        {id: 'TVAndHomeAppliances', text: 'TV & Home Appliances'},
        {id: 'SportsAndOutdoors', text: 'Sports & outdoors'},
        {id: 'HealthAndBeauty', text: 'Health & Beauty'},
        {id: 'HomeAndLifestyle', text: 'Home & Lifestyle'},
        {id: 'MensFashion', text: `Men's Fashion`},
        {id: 'WatchesBagsAndJewellery', text: `Watches, bags & Jewellery`},
        {id: 'Groceries', text: 'Groceries'},             
    ])

    // active category class
    const [active, setActive]=useState('ElectronicDevices');

    // state of category
    const [category, setCategory]=useState('Electronic Devices');
    
    // changing category and active class
    const handleCategory=(individualSpan)=>{        
        setCategory(individualSpan.text);
        setActive(individualSpan.id);                          
    }

    // state for filtered products
    const [filteredProducts, setFilteredProducts]=useState([]); 

    // filter function
    const filterFunction=()=>{
        if(products.length>1){
            const filter=products.filter((product)=>product.category===category);
            setFilteredProducts(filter);
        }
        else{
            console.log('no products to filter')
        } 
    }

    // triggering filter function
    useEffect(()=>{
        filterFunction();
     },[])

    return (
        <>
            <Navbar user={user} totalProducts={totalProducts}/>           
            <br></br>            
            
            <div className='container-fluid filter-products-main-box'>
                <div className='filter-box'>
                    <h6>Filter by category</h6>                                                 
                    {spans.map((individualSpan,index)=>(
                        <span key={index} id={individualSpan.id}
                        className={individualSpan.id===active ? active:'deactive'}
                        onClick={()=>handleCategory(individualSpan)}>{individualSpan.text}</span>
                    ))}
                </div>                 
                {filteredProducts.length>0&&(
                    <div className='my-products'>
                        <h1 className='text-center'>{category}</h1>
                        <div className='products-box'>
                            {filteredProducts.map(individualFilteredProduct=>(
                            <IndividualFilteredProduct individualFilteredProduct={individualFilteredProduct}
                                key={individualFilteredProduct.ID} addToCart={addToCart}/>
                            ))}
                        </div>
                    </div>
                )}
                {filteredProducts.length < 1&&(
                    <div className='my-products please-wait'>Loading...</div>
                )}
            </div>                              
        </>
    )
}
