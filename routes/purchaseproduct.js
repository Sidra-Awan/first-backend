const express = require("express");
const router = express.Router();
const purProduct = require("../models/purchaseproduct");
const productlisting = require("../models/products");
const { count } = require("../models/purchaseproduct");
const purchaseproduct = require("../models/purchaseproduct");

router.post("/productpurchase", async (req, res) => {
  try {
    let products = req.body.purchasing;
    let total = 0;
    for (const val of products) {
      let prod = await productlisting.findById(val?.product_id, { price: 1 });

      console.log(prod);

      let result = prod?.price * val?.quantity;
      total += result;
      console.log(total);
      console.log(result);
    }

    console.log(req.body);
    const data = new purProduct({
      userid: req.body.userid,
      purchasing: req.body.purchasing,
      subtotal: total,
      date: new Date(),
    });

    const dataToSave = data.save();
    res.status(200).json(dataToSave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/trendingprods", async (req, res) => {
  try {
    //geting data of one week
    const data = await purProduct.find(
      { date: { $gte: new Date().getTime() - 7 * 24 * 60 * 60 * 1000 } },
      { purchasing: 1 }
    );
    const newarr = [];
    data.forEach((val, ind) => {
      val?.purchasing.forEach((value, index) => {
        newarr.push({ prodId: value?.product_id });
      });
    });
    //// adding products that are been purchased, counting how many times being purchased
    const result = [];
    const vri = newarr.reduce((val, obj) => {
      if (val[obj.prodId]) {
        val[obj.prodId].count++;
      } else {
        val[obj.prodId] = { prodId: obj?.prodId, count: 1 };
        result.push(val[obj.prodId]);
      }
      return val;
    }, {});
    console.log(result);
    const highest = result.reduce(
      (frst, scnd) => (frst.count > scnd.count ? frst : scnd),
      1
    );

    //console.log(highest);
    res.status(200).json({ data: result, lala: "result is" + highest });

    // const vri = newarr.reduce(
    //   (val, item) => (val.includes(item) ? val : [...val, item]),
    //   []
    // );
    // console.log(vri);

    // res.status(200).json({ data: vri });

    // const tst = newarr?.reduce((res, value) => {

    //   if (!res[value?.prodId]) {
    //     res[value?.prodId] = {
    //       prodId : value?.prodId,

    //       count: 1,
    //     };
    //     console.log("abcccc" ,res[value?.prodId])
    //     result.push(res[value?.prodId]);
    //   } else {
    //     res[value?.prodId].count += 1

    //   }
    //   return res;
    // }, {});

    // console.log(tst);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/discountedproducts", async (req, res) => {
  try {
    const products = await productlisting.find({}, { _id: 1 });
    const orders = await purchaseproduct.find({}, { purchasing: 1 });
    // pushing only product ids in array
    const prodarr = [];
    orders.forEach((val, ind) => {
      val?.purchasing.forEach((vl, id) => {
        prodarr.push({ prod: vl?.product_id });
      });
    });
    // adding products that are been purchased, no repeated value
    const resultt = [];
    prodarr.reduce((val, obj) => {
      if (!val[obj.prod]) {
        val[obj.prod] = { purProd: obj.prod };
        resultt.push(val[obj.prod]);
      }
      return val;
    }, {});

    // matching products purchased by total product and returing unpurchased prod
    let finalprod = [];
    products.forEach((val) => {
      let pro = resultt.find((val1) => val1.purProd === val.id);
      if (!pro) {
        finalprod.push(val);
      }
    });
    
    //setting 30 discount in product db that are not purchased
    // let arr  = []
    //     for (const a of finalprod) {
    //       let dist = await productlisting.findByIdAndUpdate(
    //         a._id,
    //         { $set: { discount: 30 } },
    //         {
    //           new: true,
    //         }
    //       );
    //       arr.push(dist)
    //     }

    ///////////.......... today work.........//

    // pushing product id of order and also count
    const totalSale = [];
    const dtsale = prodarr.reduce((val, obj) => {
      if (val[obj.prod]) {
        val[obj.prod].count++;
      } else {
        val[obj.prod] = { _id: obj?.prod, count: 1 };
        totalSale.push(val[obj.prod]);
      }
      return val;
    }, {});

    console.log(totalSale);
    //combining orders and product
    const combineArray = totalSale.concat(finalprod);
    console.log(combineArray);
 

     //sorting Array
    const sortedArr = combineArray?.sort((a, b) =>
      a.count > b.count ? 1 : -1
    );
    console.log(sortedArr)
   //https://www.programiz.com/javascript/examples/sort-array-objects
   //https://www.codegrepper.com/code-examples/javascript/javascript+sort+array+of+objects+ascending+and+descending+order
// discount on frst 3
    const cutaray = sortedArr.slice(0, 3);
    if(cutaray!== null){
    for (const x of cutaray) {
      console.log(x._id);
      let lowprice = await productlisting.findByIdAndUpdate(
        x._id,
        { $set: { discount: 30 } },
        {
          new: true,
        }
      );
    }}else{
// 0 discount on remaning
    const lastarr = sortedArr.slice(3, sortedArr.length);
    console.log(lastarr)
        for (const x of lastarr){
          console.log(x._id);
            let lowprice = await productlisting.findOneAndUpdate( {_id:x._id ,discount:{$gte:0}}, { $set: { discount: 0 } },
              {
                new: true,
              }
            )}

            }
console.log(lowprice)
    res.status(200).json({ data: sortedArr });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
