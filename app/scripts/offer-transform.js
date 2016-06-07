/**
 * transform elastic search offer query to display format.  See data-model.json
 */

/* globals _, commonTransforms */
/* exported offerTransform */
/* jshint camelcase:false */

/* note lodash should be defined in parent scope, as well as commonTransforms */
var offerTransform = (function(_, commonTransforms) {

    function getGeolocation(record) {
        /** build geolocation object:
        "geo": { 
            "latitude": 33.916403, 
            "longitude": -118.352575
        }
        
        if no latitude && longitude, return undefined 
        */
        var geo;
        var latitude = _.get(record, 'availableAtOrFrom.address[0].geo.latitude');
        var longitude = _.get(record, 'availableAtOrFrom.address[0].geo.longitude');

        if(latitude && longitude) {
            geo = {};
            geo.latitude = latitude;
            geo.longitude = longitude;
        }

        return geo;
    }

    function getPerson(record) {
        /** build person object:
        "person": {
            "name": "Emily",
            "ethnicities": ["white"],
            "height": 64,
            "weight": 115,
            "ages": [20]
        }
        */
        var person = {};
        person._id = _.get(record, 'itemOffered.uri');
        person._type = "provider";
        person.name = _.get(record, 'itemOffered.name', 'Name N/A');
        person.ethnicities = _.get(record, 'itemOffered.ethnicity');
        person.height = _.get(record, 'itemOffered.height');
        person.weight = _.get(record, 'itemOffered.weight');
        person.ages = _.get(record, 'itemOffered.age');

        var title = (person.name != 'Name N/A')? person.name : "";
        var sep = (title == "")? "": ", ";
        if(person.ages) {
            title += sep + person.ages[0]
            sep = ", "
        }
        if(person.ethnicities) {
            title += sep + person.ethnicities[0]
            sep = ", "
        }
        person.title = title;
        person.show = (title.length > 0)? true: false;
        return person;
    }

    function getPrice(record) {
        var result = '';
        var prices = _.get(record, 'priceSpecification');
        if(prices) {
            var sep = ""
            prices.forEach(function(elem) {
                price = elem['name'];
                if(price != '-per-min') {
                    result = result + sep + price;
                    sep = ", ";
                }
            });
        }
        return result;
    }

    function parseOffer(record) {
        var newData = {};
        
        newData.date = _.get(record, 'validFrom');
        newData.address = commonTransforms.getAddress(record);
        newData.geo = getGeolocation(record);
        newData.person = getPerson(record);
        newData.price = getPrice(record);
        newData.title = _.get(record, 'title', 'Title N/A');
        newData.publisher = _.get(record, 'mainEntityOfPage.publisher.name');
        newData.body = _.get(record, 'mainEntityOfPage.description');
        //newData.emails = commonTransforms.getArrayOfStrings(data.hits.hits[0], '_source.seller.email', 'name');
        //newData.phones = commonTransforms.getArrayOfStrings(data.hits.hits[0], '_source.seller.telephone', 'name');
        // only get one of each for now
        newData.emails = commonTransforms.getClickableObjectArr(_.get(record, 'seller.email'), 'email');
        newData.phones = commonTransforms.getClickableObjectArr(_.get(record, 'seller.telephone'), 'phone');
        newData.sellerId = _.get(record, 'seller.uri');
        newData.serviceId = _.get(record, 'itemOffered.uri');
        newData.webpageId = _.get(record, 'mainEntityOfPage.uri');
        newData.webpageUrl = _.get(record, 'mainEntityOfPage.url');
        
        return newData;
    }
    return {
        // expected data is from an elasticsearch 
        offer: function(data) {
            var newData = {};

            if(data.hits.hits.length > 0) {
                newData = parseOffer(data.hits.hits[0]._source);
            }

            // aggregation data for sparklines -- currently unused
            if(data.aggregations) {
                var aggs = data.aggregations;
                newData.offersBySeller = commonTransforms.transformBuckets(aggs.offers_by_seller.buckets, 'date', 'key_as_string');
                newData.offerLocsBySeller = commonTransforms.transformBuckets(aggs.offer_locs_by_seller.buckets, 'city');
            }

            return newData;
        },

        revisions: function(data) {
            var newData = [];

            if(data.hits.hits.length > 0) {
                data.hits.hits.forEach(function(elem) {
                    offer = parseOffer(elem._source);
                    offer._id = elem._id;
                    offer._type = 'offer';
                    newData.push(offer);
                });
            }

            return newData;
        },

        computeShowSeller: function(sellerPhoneEmails, webpageData) {
            var webpagePhonesLen = (webpageData.phones)? webpageData.phones.length: 0;
            var webpageEmailsLen = (webpageData.emails)? webpageData.emails.length: 0;

            return sellerPhoneEmails.length != (webpageEmailsLen + webpagePhonesLen);
        }
    };

})(_, commonTransforms);
