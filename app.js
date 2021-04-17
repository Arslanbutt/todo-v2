//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.set('useFindAndModify', false);

const itemsSchema = new mongoose.Schema({
  name : String
});

const Item = mongoose.model("Item",itemsSchema);

const listSchema = new mongoose.Schema({
  name : String,
  items : [itemsSchema]
});

const List = mongoose.model("List",listSchema);

const items = [];
const workItems = [];

const item1 = new Item({
  name : "Welcome to personal Todo list"
});

const item2 = new Item({
  name : "Hit + button to add new items"
});

const item3 = new Item({
  name : "<- Click here to check off the item"
});

const defaultItems = [item1,item2,item3];





// Item.insertMany(defaultItems,function(err){
//   if(err){
//     console.log(err);
//   } else{
//     console.log("Successfully done with insertion");
//   }
// });

// List.deleteMany(function(err){
//   if(err){
//     console.log(err);
//   }else{
//     console.log('Done');
//   }
// });



app.get("/", function(req, res) {

  Item.find({},function(err,items){

    if(items.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        } else{
          console.log("Successfully done with insertion");
        }
      });
      res.redirect('/');
    } else{
      res.render("list", {
        listTitle: "Today",
        newListItems: items
      });
    }
});
});
app.post("/", function(req, res) {

  const itemName = req.body.newItem;

  const listName = req.body.list;

  const item = new Item({
    name : itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect('/');
  } else{
    List.findOne({name: listName}, function(err, listfound){
      if(!err){
        if(listfound){
          listfound.items.push(item);
          listfound.save();
          res.redirect("/" + listName);
        }
      }
    });
  }


  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post('/delete',function(req,res){
   const checkedBox = req.body.checkbox;
   const listName = req.body.listName;
   console.log(listName);
   if(listName === "Today"){
     Item.findByIdAndDelete(checkedBox,function(err){
       if(err){
         console.log(err);
       }else{
         console.log("Success in deletion");
         res.redirect('/');
       }
     });
   }else{
     List.findOneAndUpdate({name: listName},{$pull : {items:{_id : checkedBox}}}, function(err,foundList){
       if(!err){
         res.redirect('/' + listName);
       }
     });
   }
});

// app.get("/work", function(req, res) {
//   res.render("list", {
//     listTitle: "Work List",
//     newListItems: workItems
//   });
// });

app.get("/about", function(req, res) {
  res.render("about");
});


app.get('/:customListName',function(req,res){
  const customListName = req.params.customListName;

  List.findOne({name:customListName},function(err,itemFound){
    if(!err){
      if(!itemFound){
        const list = new List({
          name : customListName,
          items : defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }else{
        console.log("Exist already");
        res.render("list",{
          listTitle : itemFound.name,
          newListItems : itemFound.items
        });
      }
    }
  });

  // res.render("list", {
  //   listTitle: "Today",
  //   newListItems: list.list
  // });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
