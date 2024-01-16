import { ApifyClient } from 'apify-client';
import { LocalStorage } from "node-localstorage";
import OpenAI from "openai";
// import express from 'express';
import express from 'express';
import cors from 'cors';
const app = express();
const corsOptions = {
    origin: '*',
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200,
}
const localStorage = new LocalStorage('./scratch');

const openai = new OpenAI({
    organization: 'org-tmD6RAFU6COZM67DqoCwAe91',
    apiKey: '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'
});
const apiKey = 'ODE4YWFkMjllZTAxNGIxMWFkOTYzMjIzYjJiMjNjYTl8MTU3ZTc5NjY3Yw'
// Initialize the ApifyClient with API token
const client = new ApifyClient({
    token: 'apify_api_65IYpR4tcPft6twAxjYeTfRJIoSf8F23zag1',
});

// Prepare Actor input

app.use(cors(corsOptions));
const port = process.env.PORT || 3001; // Use the environment port or default to 3001
// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/public", express.static("public"));

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.get('/api/:searchQuery', (req, res) => {
const searchQuery = req.params.searchQuery;
console.log(searchQuery);
try {
    const input = {
        "queries": searchQuery + " buy Amazon India",
        "maxPagesPerQuery": 1,
        "resultsPerPage": 10,
        "mobileResults": false,
        "languageCode": "",
        "maxConcurrency": 10,
        "saveHtml": false,
        "saveHtmlToKeyValueStore": false,
        "includeUnfilteredResults": false,
        "customDataFunction": async ({ input, $, request, response, html }) => {
            return {
                pageTitle: $('title').text(),
            };
        }
    };
    (async () => {
        // Run the Actor and wait for it to finish
        const run = await client.actor("nFJndFXA5zjCTuudP").call(input);
    
        // Fetch and print Actor results from the run's dataset (if any)
        console.log('Results from dataset');
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        localStorage.setItem('items', JSON.stringify(items));
        // const items = JSON.parse(localStorage.getItem('items'));
        items.forEach((item, index) => {
            console.dir(index + ".." + item);
        });
    
        const amazonUrls = [];
    
        // Iterate through each result in the organicResults array
        var i = 0;
        items[0].organicResults.forEach(result => {
            // Check if the URL starts with "https://www.amazon.com" and contains "/dp"
            if (i < 1 && result.url.startsWith("https://www.amazon.in") && result.url.includes("/dp")) {
                // Store the matching URL in the array
                amazonUrls.push(result.url);
                i++;
            }
        });
    
        // Print the array of Amazon URLs
        console.log("Amazon urls", amazonUrls);
        //get "the value of organicResults from items"
        amazonUrls.forEach(url => {
            console.log(url);
            (async () => {
    
                const reviews = [];
                // call amazon reviews scrapper api using fetch using get request with authoziation header
    
                /* 
                curl -X GET "https://api.app.outscraper.com/amazon/reviews?query=https://www.amazon.com/dp/1612680194&limit=3&async=false" 
                -H  "X-API-KEY: ODE4YWFkMjllZTAxNGIxMWFkOTYzMjIzYjJiMjNjYTl8MTU3ZTc5NjY3Yw"
                */
                const response = await fetch(
                    `https://api.app.outscraper.com/amazon/reviews?query= ${url}&limit=10&async=false`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    }
                },
                );
                const data = await response.json();
                console.log("API response data: ", data);
    
    
                localStorage.setItem('reviews', JSON.stringify(data));
    
                // const reviewsData = {
                //     "id": "a-2c98b5a6-7f52-4c9e-a26f-77c49a1cb2c9",
                //     "status": "Success",
                //     "data": [
                //         [
                //             {
                //                 "query": " https://www.amazon.com/SAMSUNG-Unlocked-Android-Smartphone-Processor/dp/B0CD99XXQY",
                //                 "id": "R1N3POFHV4OY86",
                //                 "product_asin": "B0CD99XXQY",
                //                 "title": "Feels Heavy, but solid",
                //                 "body": "It's heavier and a bit thicker than my Moto G which I had to replace due to broken screen. Wasn't worth fixing. It feels solid, dropped a couple of times and it survived, thankfully. Picture quality is awesome. Be warned, it does not have a headphone jack. Wish it did so that I could connect it to radios which do not have Bluetooth. Also, could not get the provider I wanted because their system did not have this on approved list yet. Had to choose another provider (Visible by Verizon.) ATT & Verizon recognized it with no issues. But, Spectrum did not (that's the one I wanted), neither did Metro PCS (T-Mobile), which both companies did sell the exact phone at a higher price, weird. Definitely faster than my old Moto G Stylus (2020), I can browse much easier and faster. And, the apps load up faster. I just think it's a bit too expensive for what it is. I maybe expecting too much, but battery life seems wanting. I really didn't put it to a formal test, but during the first days of setting up the phone I had to charge it a lot. Even now, I have to charge it once a day, and I mainly use it for using the apps to do minimal work. So, take my rating on battery life with a grain of a salt.",
                //                 "rating": 5,
                //                 "rating_text": "5.0 out of 5 stars",
                //                 "helpful": "5 people found this helpful",
                //                 "comments": null,
                //                 "date": "Reviewed in the United States on January 3, 2024",
                //                 "badge": "Verified Purchase",
                //                 "official_comment_banner": "",
                //                 "url": "https://www.amazon.com/gp/customer-reviews/R1N3POFHV4OY86/ref=cm_cr_arp_d_rvw_ttl?ie=UTF8&ASIN=B0CD99XXQY",
                //                 "img_url": null,
                //                 "variation": "Color: Graphite|Size: 128GB|Pattern Name: S23 FE Only",
                //                 "total_reviews": 276,
                //                 "overall_rating": 4.4,
                //                 "author_title": "Digigear",
                //                 "author_descriptor": "",
                //                 "author_url": "https://www.amazon.com/gp/profile/amzn1.account.AGEFHQIH4NQRGH77VHSHYI5DQDVQ/ref=cm_cr_arp_d_gw_btm?ie=UTF8",
                //                 "author_profile_img": "https://images-na.ssl-images-amazon.com/images/S/amazon-avatars-global/default._CR0,0,1024,1024_SX48_.png",
                //                 "product_name": "SAMSUNG Galaxy S23 FE Cell Phone, 128GB, Unlocked Android Smartphone, Long Battery Life, Premium Processor, Tough Gorilla Glass Display, Hi-Res 50MP Camera, US Version, 2023, Mint",
                //                 "product_url": "https://www.amazon.com/dp/B0CD99XXQY"
                //             },
                //             {
                //                 "query": " https://www.amazon.com/SAMSUNG-Unlocked-Android-Smartphone-Processor/dp/B0CD99XXQY",
                //                 "id": "R2E4NVXJUGZ73F",
                //                 "product_asin": "B0CD99XXQY",
                //                 "title": "Very nice phone.",
                //                 "body": "This S23FE was a great upgrade from my S9. Easy to import all of my contacts, apps, photo's & files. It took some time using the smart swith app for Android as I had thousands of photos but was all done in the app. It's much faster than the S9 but the easy to use of the android system. It is totally unlocked as advertised and connected to the Verizon network right away. FYI: get a new sim card rather than using your old phones existing sim card. The only issue I ran into was by using my S9 sim card it was registered to the old phone and discovered it was in the new S23fe which it didn't like. It stopped communicating with verizon. The techs at verizon fixed everything quickly and it now works perfectly all at no charge! The camera portion of the phone takes ok selfies and basic photographs. The zoom feature came out a little blurry. Not the best camera setup but the phone/texting and all apps function as desired. All in all I'm totally satisfied with the newest Galaxy model plus saved over $100 by purchasing online. Samsung quality.",
                //                 "rating": 5,
                //                 "rating_text": "5.0 out of 5 stars",
                //                 "helpful": "6 people found this helpful",
                //                 "comments": null,
                //                 "date": "Reviewed in the United States on January 2, 2024",
                //                 "badge": "Verified Purchase",
                //                 "official_comment_banner": "",
                //                 "url": "https://www.amazon.com/gp/customer-reviews/R2E4NVXJUGZ73F/ref=cm_cr_arp_d_rvw_ttl?ie=UTF8&ASIN=B0CD99XXQY",
                //                 "img_url": null,
                //                 "variation": "Color: Graphite|Size: 128GB|Pattern Name: S23 FE Only",
                //                 "total_reviews": 276,
                //                 "overall_rating": 4.4,
                //                 "author_title": "Jeffrey Doerr",
                //                 "author_descriptor": "",
                //                 "author_url": "https://www.amazon.com/gp/profile/amzn1.account.AER2O7E6T3Y6J5MP4BURYJMNUTPQ/ref=cm_cr_arp_d_gw_btm?ie=UTF8",
                //                 "author_profile_img": "https://images-na.ssl-images-amazon.com/images/S/amazon-avatars-global/6f3db319-1e53-4a24-91e6-6d5e4b8ab60b._CR0,0,500,500_SX48_.jpg",
                //                 "product_name": "SAMSUNG Galaxy S23 FE Cell Phone, 128GB, Unlocked Android Smartphone, Long Battery Life, Premium Processor, Tough Gorilla Glass Display, Hi-Res 50MP Camera, US Version, 2023, Mint",
                //                 "product_url": "https://www.amazon.com/dp/B0CD99XXQY"
                //             },
                //             {
                //                 "query": " https://www.amazon.com/SAMSUNG-Unlocked-Android-Smartphone-Processor/dp/B0CD99XXQY",
                //                 "id": "R3VAMW83LGY20L",
                //                 "product_asin": "B0CD99XXQY",
                //                 "title": "Excellent device and great deal.",
                //                 "body": "This phone was purchased to replace n LG V35 that the battery was dying on.  This Fan Edition phone does not disappoint.  Don't worry that it's not the absolute newest processor.  It is the same one used in last years flagships.  This device functions exceptionally well.  Super responsive and handles all video and multitasking with ease.  Everything works great and the battery lasted all day which I haven't been able to enjoy in a long time.  I also had no issue with the fingerprint scanner after applying a glass screen protector and toggling the switch in settings letting the device know that it has a screen protector.  For those of you with AT&T, I was able to pop in my existing sim from family plan and the phone started thinking for a minute and then stated that it was configuring the network.  After that it restarted and boom, connected with 5g and all.  I got this phone for $599 and it also had a $100 Amazon gift card included as well.  Just buy it, you won't regret it.",
                //                 "rating": 5,
                //                 "rating_text": "5.0 out of 5 stars",
                //                 "helpful": "50 people found this helpful",
                //                 "comments": null,
                //                 "date": "Reviewed in the United States on October 29, 2023",
                //                 "badge": "Verified Purchase",
                //                 "official_comment_banner": "",
                //                 "url": "https://www.amazon.com/gp/customer-reviews/R3VAMW83LGY20L/ref=cm_cr_arp_d_rvw_ttl?ie=UTF8&ASIN=B0CD99XXQY",
                //                 "img_url": null,
                //                 "variation": "Color: Graphite|Size: 128GB|Pattern Name: S23 FE Only",
                //                 "total_reviews": 276,
                //                 "overall_rating": 4.4,
                //                 "author_title": "Amazon Customer",
                //                 "author_descriptor": "",
                //                 "author_url": "https://www.amazon.com/gp/profile/amzn1.account.AFO733L7VXPH5PVBESOET4G4SZHQ/ref=cm_cr_arp_d_gw_btm?ie=UTF8",
                //                 "author_profile_img": "https://images-na.ssl-images-amazon.com/images/G/01/x-locale/common/grey-pixel.gif",
                //                 "product_name": "SAMSUNG Galaxy S23 FE Cell Phone, 128GB, Unlocked Android Smartphone, Long Battery Life, Premium Processor, Tough Gorilla Glass Display, Hi-Res 50MP Camera, US Version, 2023, Mint",
                //                 "product_url": "https://www.amazon.com/dp/B0CD99XXQY"
                //             }
                //         ]
                //     ]
                // }
                // get "the reviewTitle and reviewDEscription from reviews
    
                var string = "";
                data.data[0].forEach(review => {
                    string += review.body + " ";
                    console.log(review.body);
                });
    
    
    
                /*items.forEach((item) => {
                    console.dir(item);
                    reviews.push(item);
                });
                localStorage.setItem('reviews', JSON.stringify(reviews));
    
    
    */
                console.log("\n");
                const completion = await openai.chat.completions.create({
                    messages: [{ role: "system",
                    content: "Summrize the following reviews and combine into a final one. The final review should be structured with sub-headings and don't include the word amazon in it. Here are the reviews: " + string }],
                    model: "gpt-3.5-turbo",
                });
    
                console.log(completion.choices[0].message.content);
                res.send(completion.choices[0].message.content);
            })();
    
        }
        );
    
    
    
    
    })();
} catch (error) {
    res.status(500).send({ message: error.message });
}
});
