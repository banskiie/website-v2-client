import { CLOUD } from "../main-faq"

export interface DrinkItem {
  name: string
  category: string
  description: string
  img: string
  ingredients: string
  price: number
  oldPrice: number
  tag: string
}

export const drinks: DrinkItem[] = [

  // Espresso
  { name: "Caramel Macchiato", category: "Espresso", img: `${CLOUD}/v1773104373/Untitled_design_iwzizs.png`, description: "Sweet and rich caramel espresso drink", ingredients: "Espresso, Milk, Caramel", price: 130.00, oldPrice: 4.5, tag: "" },
  { name: "Caramel Popcorn", category: "Espresso", img: `${CLOUD}/v1773104603/Caramel_Popcorn_qwbfpz.png`, description: "Espresso with a hint of caramel popcorn flavor", ingredients: "Espresso, Milk, Caramel, Popcorn Essence", price: 130.00, oldPrice: 4.5, tag: "" },
  // { name: "Creme Brulee", category: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/drinks/_ALP9563.png", description: "Smooth espresso infused with creme brulee flavor", ingredients: "Espresso, Milk, Caramelized Sugar, Vanilla", price: 130.00, oldPrice: 4.5, tag: "" },
  { name: "Classic Mocha", category: "Espresso", img: `${CLOUD}/v1773105070/Untitled_design_2_idr8as.png`, description: "Chocolatey espresso delight", ingredients: "Espresso, Milk, Chocolate Syrup", price: 130.00, oldPrice: 4.5, tag: "" },
  { name: "Spanish Latte", category: "Espresso", img: `${CLOUD}/v1773105182/Untitled_design_3_qlnsjg.png`, description: "Sweet and creamy Spanish-style latte", ingredients: "Espresso, Condensed Milk, Steamed Milk", price: 130.00, oldPrice: 4.5, tag: "" },
  { name: "Matcha Latte", category: "Espresso", img: `${CLOUD}/v1773105330/Matcha_Latte_afbrd9.png`, description: "Matcha latte with espresso shot", ingredients: "Matcha, Milk, Espresso", price: 130.00, oldPrice: 4.5, tag: "" },
]

// export const drinks: DrinkItem[] = [

//   // Espresso
//   { name: "Caramel Macchiato", category: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/drinks/Caramel Macchiato.png", description: "Sweet and rich caramel espresso drink", ingredients: "Espresso, Milk, Caramel", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Caramel Popcorn", category: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/drinks/Caramel Popcorn.png", description: "Espresso with a hint of caramel popcorn flavor", ingredients: "Espresso, Milk, Caramel, Popcorn Essence", price: 130.00, oldPrice: 4.5, tag: "" },
//   // { name: "Creme Brulee", category: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/drinks/_ALP9563.png", description: "Smooth espresso infused with creme brulee flavor", ingredients: "Espresso, Milk, Caramelized Sugar, Vanilla", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Classic Mocha", category: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/drinks/Classic Mocha.png", description: "Chocolatey espresso delight", ingredients: "Espresso, Milk, Chocolate Syrup", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Spanish Latte", category: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/drinks/Spanish Latte.png", description: "Sweet and creamy Spanish-style latte", ingredients: "Espresso, Condensed Milk, Steamed Milk", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Matcha Latte", category: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/drinks/Matcha Latte.png", description: "Matcha latte with espresso shot", ingredients: "Matcha, Milk, Espresso", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Sweet Potato Latte", category: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/drinks/sweet-potato-latte.png", description: "Espresso with sweet potato flavor", ingredients: "Espresso, Milk, Sweet Potato Paste", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Toasted Marshmallow Latte", category: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/drinks/toasted-marshmallow-latte.png", description: "Toasty, sweet latte with marshmallow", ingredients: "Espresso, Milk, Marshmallow, Vanilla", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Pandan Latte", category: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/drinks/pandan-latte.png", description: "Fragrant pandan infused latte", ingredients: "Espresso, Milk, Pandan Syrup", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Toffeenut Latte", category: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/drinks/toffeenut-latte.png", description: "Nutty espresso with toffee flavor", ingredients: "Espresso, Milk, Toffee, Hazelnut", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Coco Creme Latte", category: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/drinks/coco-creme-latte.png", description: "Chocolatey latte with creamy coconut notes", ingredients: "Espresso, Milk, Cocoa, Coconut Cream", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Butter Corn Latte", category: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/drinks/butter-corn-latte.png", description: "Unique sweet corn butter latte", ingredients: "Espresso, Milk, Corn, Butter", price: 130.00, oldPrice: 4.5, tag: "" },
 
// ]

// export interface DrinkItem {
//   name: string
//   category: string
//   description: string
//   img: string
//   ingredients: string
//   price: number
//   oldPrice: number
//   tag: string
// }

// export const drinks: DrinkItem[] = [

//   // Espresso
//   { name: "Caramel Macchiato", category: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/Caramel Macchiato.jpg", description: "Sweet and rich caramel espresso drink", ingredients: "Espresso, Milk, Caramel", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Caramel Popcorn", category: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/Caramel Popcorn.jpg", description: "Espresso with a hint of caramel popcorn flavor", ingredients: "Espresso, Milk, Caramel, Popcorn Essence", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Creme Brulee", category: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/_ALP9563.jpg", description: "Smooth espresso infused with creme brulee flavor", ingredients: "Espresso, Milk, Caramelized Sugar, Vanilla", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Classic Mocha", category: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/Classic Mocha.jpg", description: "Chocolatey espresso delight", ingredients: "Espresso, Milk, Chocolate Syrup", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Spanish Latte", category: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/Spanish Latte.jpg", description: "Sweet and creamy Spanish-style latte", ingredients: "Espresso, Condensed Milk, Steamed Milk", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Sweet Potato Latte", category: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/sweet-potato-latte.jpg", description: "Espresso with sweet potato flavor", ingredients: "Espresso, Milk, Sweet Potato Paste", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Toasted Marshmallow Latte", category: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/toasted-marshmallow-latte.jpg", description: "Toasty, sweet latte with marshmallow", ingredients: "Espresso, Milk, Marshmallow, Vanilla", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Pandan Latte", category: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/pandan-latte.jpg", description: "Fragrant pandan infused latte", ingredients: "Espresso, Milk, Pandan Syrup", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Toffeenut Latte", category: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/toffeenut-latte.jpg", description: "Nutty espresso with toffee flavor", ingredients: "Espresso, Milk, Toffee, Hazelnut", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Coco Creme Latte", category: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/coco-creme-latte.jpg", description: "Chocolatey latte with creamy coconut notes", ingredients: "Espresso, Milk, Cocoa, Coconut Cream", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Butter Corn Latte", category: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/butter-corn-latte.jpg", description: "Unique sweet corn butter latte", ingredients: "Espresso, Milk, Corn, Butter", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Dirty Matcha Latte", category: "Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/dirty-matcha-latte.jpg", description: "Matcha latte with espresso shot", ingredients: "Matcha, Milk, Espresso", price: 130.00, oldPrice: 4.5, tag: "" },

//   // Espresso Based
//   { name: "Espresso", category: "Espresso Based", img: "/assets/img/sports-center/shuttlebrew/menu/Espresso_based.jpg", description: "Pure espresso shot", ingredients: "Espresso Beans, Water", price: 130.00, oldPrice: 130.00, tag: "" },
//   { name: "Americano", category: "Espresso Based", img: "/assets/img/sports-center/shuttlebrew/menu/Americano.jpg", description: "Espresso diluted with hot water", ingredients: "Espresso, Hot Water", price: 130.00, oldPrice: 130.00, tag: "" },

//   // Milk-Based Espresso
//   { name: "Flat White", category: "Milk-Based Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/Flat White.jpg", description: "Velvety milk with espresso", ingredients: "Espresso, Steamed Milk", price: 130.00, oldPrice: 130.00, tag: "" },
//   { name: "Cappucino", category: "Milk-Based Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/Cappuccino.jpg", description: "Classic cappuccino with foam", ingredients: "Espresso, Steamed Milk, Foam", price: 130.00, oldPrice: 130.00, tag: "" },
//   { name: "Caffe Latte", category: "Milk-Based Espresso", img: "/assets/img/sports-center/shuttlebrew/menu/Cafe Latte.jpg", description: "Smooth latte with espresso", ingredients: "Espresso, Steamed Milk", price: 130.00, oldPrice: 130.00, tag: "" },

//   // Cheese Cake Series
//   { name: "Strawberry", category: "Cheese Cake Series", img: "/assets/img/sports-center/shuttlebrew/menu/cheesecake-strawberry.jpg", description: "Strawberry flavored cheesecake drink", ingredients: "Cheesecake Base, Strawberry Syrup, Milk", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Blueberry", category: "Cheese Cake Series", img: "/assets/img/sports-center/shuttlebrew/menu/cheesecake-blueberry.jpg", description: "Blueberry flavored cheesecake drink", ingredients: "Cheesecake Base, Blueberry Syrup, Milk", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Oreo", category: "Cheese Cake Series", img: "/assets/img/sports-center/shuttlebrew/menu/cheesecake-oreo.jpg", description: "Oreo cheesecake drink", ingredients: "Cheesecake Base, Oreo Crumbs, Milk", price: 130.00, oldPrice: 4.5, tag: "" },

//   // Banan Series
//   { name: "Banana Creme Brulee", category: "Banan Series", img: "/assets/img/sports-center/shuttlebrew/menu/banana-creme-brulee.jpg", description: "Banana smoothie with creme brulee flavor", ingredients: "Banana, Milk, Caramel, Sugar", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Matcha Banana", category: "Banan Series", img: "/assets/img/sports-center/shuttlebrew/menu/matcha-banana.jpg", description: "Banana smoothie with matcha", ingredients: "Banana, Milk, Matcha Powder", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Olala Banana", category: "Banan Series", img: "/assets/img/sports-center/shuttlebrew/menu/olala-banana.jpg", description: "Sweet banana smoothie", ingredients: "Banana, Milk, Honey", price: 130.00, oldPrice: 4.5, tag: "" },

//   // Yogurt Series
//   { name: "Green Apple", category: "Yogurt Series", img: "/assets/img/sports-center/shuttlebrew/menu/yogurt-green-apple.jpg", description: "Refreshing green apple yogurt", ingredients: "Yogurt, Green Apple, Honey", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Strawberry", category: "Yogurt Series", img: "/assets/img/sports-center/shuttlebrew/menu/yogurt-strawberry.jpg", description: "Fresh strawberry yogurt drink", ingredients: "Yogurt, Strawberry, Honey", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Blueberry", category: "Yogurt Series", img: "/assets/img/sports-center/shuttlebrew/menu/yogurt-blueberry.jpg", description: "Blueberry yogurt delight", ingredients: "Yogurt, Blueberry, Honey", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Mango", category: "Yogurt Series", img: "/assets/img/sports-center/shuttlebrew/menu/yogurt-mango.jpg", description: "Mango yogurt smoothie", ingredients: "Yogurt, Mango, Honey", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Mango Cheese Graham", category: "Yogurt Series", img: "/assets/img/sports-center/shuttlebrew/menu/yogurt-mango-cheese-graham.jpg", description: "Mango yogurt with cheese graham", ingredients: "Yogurt, Mango, Cheese Graham", price: 130.00, oldPrice: 4.5, tag: "" },
//   { name: "Buko Pandan", category: "Yogurt Series", img: "/assets/img/sports-center/shuttlebrew/menu/yogurt-buko-pandan.jpg", description: "Buko pandan flavored yogurt", ingredients: "Yogurt, Buko, Pandan, Sugar", price: 130.00, oldPrice: 4.5, tag: "" },

//   // Frapped (Coffee Based)
//   { name: "Caramel Popcorn", category: "Frapped", img: "/assets/img/sports-center/shuttlebrew/menu/Caramel_Popcorn_Frappe.jpg", description: "Coffee-based caramel frappe", ingredients: "Espresso, Milk, Caramel, Ice", price: 130.00, oldPrice: 5.0, tag: "" },
//   { name: "Choco Hazelnut", category: "Frapped", img: "/assets/img/sports-center/shuttlebrew/menu/Choco_Hazelnut_Frappe.jpg", description: "Chocolate and hazelnut frappe", ingredients: "Espresso, Milk, Chocolate, Hazelnut, Ice", price: 130.00, oldPrice: 5.0, tag: "" },
//   { name: "Walnut Brownie", category: "Frapped", img: "/assets/img/sports-center/shuttlebrew/menu/Walnut_Brownie.jpg", description: "Frappe with walnut brownie flavor", ingredients: "Espresso, Milk, Walnut, Brownie, Ice", price: 130.00, oldPrice: 5.0, tag: "" },
//   { name: "Espresso Shake", category: "Frapped", img: "/assets/img/sports-center/shuttlebrew/menu/Espresso_Shake_Frappe.jpg", description: "Espresso milkshake frappe", ingredients: "Espresso, Milk, Ice, Sugar", price: 130.00, oldPrice: 5.0, tag: "" },
//   { name: "Chocolate Cookie", category: "Frapped", img: "/assets/img/sports-center/shuttlebrew/menu/frapped-chocolate-cookie.jpg", description: "Chocolate cookie frappe", ingredients: "Espresso, Milk, Chocolate, Cookies, Ice", price: 130.00, oldPrice: 5.0, tag: "" },
//   { name: "Tiramisu Frappe", category: "Frapped", img: "/assets/img/sports-center/shuttlebrew/menu/frapped-tiramisu.jpg", description: "Tiramisu inspired frappe", ingredients: "Espresso, Milk, Mascarpone, Cocoa, Ice", price: 130.00, oldPrice: 5.0, tag: "" },

//   // Non-Caffeinated
//   { name: "Babyccino (Chocolate)", category: "Non-Caffeinated", img: "/assets/img/sports-center/shuttlebrew/menu/non-caffeinated-babyccino.jpg", description: "Chocolate milk froth drink", ingredients: "Milk, Chocolate, Foam", price: 130.00, oldPrice: 4.0, tag: "" },
//   { name: "Honey Citron Tea", category: "Non-Caffeinated", img: "/assets/img/sports-center/shuttlebrew/menu/Honey Citron Tea.jpg", description: "Sweet and tangy honey citron tea", ingredients: "Honey, Citron, Hot Water", price: 130.00, oldPrice: 4.0, tag: "" },
//   { name: "Matcha Latte", category: "Non-Caffeinated", img: "/assets/img/sports-center/shuttlebrew/menu/Matcha Latte.jpg", description: "Creamy matcha drink", ingredients: "Matcha, Milk, Sugar", price: 130.00, oldPrice: 4.0, tag: "" },
//   { name: "Berry Matcha", category: "Non-Caffeinated", img: "/assets/img/sports-center/shuttlebrew/menu/non-caffeinated-berry-matcha.jpg", description: "Berry flavored matcha drink", ingredients: "Matcha, Milk, Mixed Berries", price: 130.00, oldPrice: 4.0, tag: "" },
//   { name: "Peach & Oolong Tea", category: "Non-Caffeinated", img: "/assets/img/sports-center/shuttlebrew/menu/non-caffeinated-peach-oolong.jpg", description: "Peach flavored oolong tea", ingredients: "Peach, Oolong Tea, Honey", price: 130.00, oldPrice: 4.0, tag: "" },
//   { name: "Passion Fruit Tea", category: "Non-Caffeinated", img: "/assets/img/sports-center/shuttlebrew/menu/non-caffeinated-passion-fruit.jpg", description: "Tropical passion fruit tea", ingredients: "Passion Fruit, Tea, Honey", price: 130.00, oldPrice: 4.0, tag: "" },
//   { name: "Honey Lemon Tea", category: "Non-Caffeinated", img: "/assets/img/sports-center/shuttlebrew/menu/non-caffeinated-honey-lemon.jpg", description: "Refreshing honey lemon tea", ingredients: "Honey, Lemon, Hot Water", price: 130.00, oldPrice: 4.0, tag: "" },

//   // Sparkling Drinks
//   { name: "Peach Mango", category: "Sparkling Drinks", img: "/assets/img/sports-center/shuttlebrew/menu/20241007_150656.jpg", description: "Fruity sparkling drink", ingredients: "Peach, Mango, Soda", price: 130.00, oldPrice: 5.0, tag: "" },
//   { name: "Granny Smith", category: "Sparkling Drinks", img: "/assets/img/sports-center/shuttlebrew/menu/20241007_142045.jpg", description: "Apple flavored sparkling drink", ingredients: "Granny Smith Apple, Soda", price: 130.00, oldPrice: 5.0, tag: "" },
//   { name: "Passion Tropics", category: "Sparkling Drinks", img: "/assets/img/sports-center/shuttlebrew/menu/20241007_141958.jpg", description: "Tropical sparkling drink", ingredients: "Passion Fruit, Mango, Soda", price: 130.00, oldPrice: 5.0, tag: "" },
//   { name: "Tropical", category: "Sparkling Drinks", img: "/assets/img/sports-center/shuttlebrew/menu/20241007_101559.jpg", description: "Refreshing tropical soda", ingredients: "Pineapple, Mango, Soda", price: 130.00, oldPrice: 5.0, tag: "" },
//   { name: "Nature's Harmony", category: "Sparkling Drinks", img: "/assets/img/sports-center/shuttlebrew/menu/20241007_104247.jpg", description: "Mixed fruit sparkling delight", ingredients: "Mixed Fruits, Soda", price: 130.00, oldPrice: 5.0, tag: "" },
//   { name: "Strawberry Breeze", category: "Sparkling Drinks", img: "/assets/img/sports-center/shuttlebrew/menu/20241007_150656.jpg", description: "Strawberry sparkling drink", ingredients: "Strawberry, Soda", price: 130.00, oldPrice: 5.0, tag: "" },
//   { name: "Lychee Flora", category: "Sparkling Drinks", img: "/assets/img/sports-center/shuttlebrew/menu/espresso-soda.jpg", description: "Lychee flavored sparkling drink", ingredients: "Lychee, Soda", price: 130.00, oldPrice: 5.0, tag: "" },
//   { name: "Fuji Mint Apple", category: "Sparkling Drinks", img: "/assets/img/sports-center/shuttlebrew/menu/20241007_101809.jpg", description: "Apple and mint sparkling drink", ingredients: "Fuji Apple, Mint, Soda", price: 130.00, oldPrice: 5.0, tag: "" },

//   // Espresso Soda Signature
//   { name: "Espresso Tonic", category: "Espresso Soda Signature", img: "/assets/img/sports-center/shuttlebrew/menu/espresso-soda.jpg", description: "Espresso with tonic water", ingredients: "Espresso, Tonic Water, Ice", price: 130.00, oldPrice: 5.0, tag: "" },
//   { name: "Passion Sparkshot", category: "Espresso Soda Signature", img: "/assets/img/sports-center/shuttlebrew/menu/Passion Sparkshot.jpg", description: "Espresso with passion fruit soda", ingredients: "Espresso, Passion Fruit, Soda", price: 130.00, oldPrice: 5.0, tag: "" },

//   // Lemonade Coolers
//   { name: "Cucumber Lemonade", category: "Lemonade Coolers", img: "/assets/img/sports-center/shuttlebrew/menu/20241007_101809.jpg", description: "Refreshing cucumber lemonade", ingredients: "Cucumber, Lemon, Water, Sugar", price: 130.00, oldPrice: 4.0, tag: "" },
//   { name: "House Blend Ice Tea", category: "Lemonade Coolers", img: "/assets/img/sports-center/shuttlebrew/menu/20241007_101559.jpg", description: "Chilled house blend iced tea", ingredients: "Tea Leaves, Ice, Sugar, Lemon", price: 130.00, oldPrice: 4.0, tag: "" },
//   { name: "Blue Lemonade", category: "Lemonade Coolers", img: "/assets/img/sports-center/shuttlebrew/menu/blueLemonade.jpg", description: "Refreshing blue lemonade", ingredients: "Blue Curacao, Lemon, Sugar, Water", price: 130.00, oldPrice: 4.0, tag: "" },
// ]