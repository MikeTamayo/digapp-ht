/**
 * transform elastic search offer query to display format.  See data-model.json
 */

/* globals _, commonTransforms */
/* exported offerTransform */
/* jshint camelcase:false */

/* note lodash should be defined in parent scope, as well as commonTransforms */
var offerTransform = (function(_, commonTransforms) {

    function getAddress(record) {
        /** build address object:
        "address": {
            "locality": "Los Angeles",
            "region": "California",
            "country": "US",
            "formattedAddress": 'Los Angeles, California, US'
        }
        */
        var address = {};
        address.locality = _.get(record, 'availableAtOrFrom.address[0].addressLocality');
        address.region = _.get(record, 'availableAtOrFrom.address[0].addressRegion');
        address.country = _.get(record, 'availableAtOrFrom.address[0].addressCountry');

        var formattedAddress = [];
        if(address.locality) {
            formattedAddress.push(address.locality);
        }

        if(address.region) {
            if(formattedAddress.length > 0) {
                formattedAddress.push(', ');
            }
            formattedAddress.push(address.region);
        }

        if(address.country) {
            if(formattedAddress.length > 0) {
                formattedAddress.push(', ');
            }
            formattedAddress.push(address.country);
        }

        address.formattedAddress = formattedAddress.join('');

        return address;
    }

    function getGeolocation(record) {
        /** build geolocation object:
        "geo": { 
            "lat": 33.916403, 
            "lon": -118.352575
        }
        
        if no lat && lon, return undefined 
        */
        var geo;
        var lat = _.get(record, 'availableAtOrFrom.geo.lat');
        var lon = _.get(record, 'availableAtOrFrom.geo.lon');

        if(lat && lon) {
            geo = {};
            geo.lat = lat;
            geo.lon = lon;
        }

        return geo;
    }

    function getPerson(record) {
        /** build person object:
        "person": {
            "name": "Emily", 
            "eyeColor": "blue",
            "hairColor": "brown",
            "height": 64,
            "weight": 115,
            "age": 20
        }
        */
        var person = {};
        person.name = _.get(record, 'itemOffered.name');
        person.eyeColor = _.get(record, 'itemOffered.eyeColor');
        person.hairColor = _.get(record, 'itemOffered.hairColor');
        person.height = _.get(record, 'itemOffered[schema:height]');
        person.weight = _.get(record, 'itemOffered[schema:weight]');
        person.age = _.get(record, 'itemOffered.personAge');
        return person;
    }

    function getPrices(record) {
        var prices = [];
        var priceArr = _.get(record, '_source.priceSpecification', []);
        priceArr.forEach(function(priceElem) {
            var price = {
                amount: priceElem.price, 
                unitCode: priceElem.unitCode, 
                billingIncrement: priceElem.billingIncrement, 
                date: record.validFrom
            };
            prices.push(price);
        });
        return prices;
    }

    function getPhones(record) {
        var phones = [];
        var phoneArr = _.get(record, '_source.seller.telephone', []);
        phoneArr.forEach(function(phoneElem) {
            phones.push(_.get(phoneElem, 'name[0]'));
        });
        return phones;
    }

    function getEmails(record) {
        var emails = [];
        var emailArr = _.get(record, '_source.seller.email', []);
        emailArr.forEach(function(emailElem) {
            emails.push(_.get(emailElem, 'name[0]'));
        });
        return emails;
    }

    return {
        // expected data is from an elasticsearch 
        offer: function(data) {
            var newData = {};

            if(data.hits.hits.length > 0) {
                
                newData.date = _.get(data.hits.hits[0]._source, 'validFrom');
                newData.address = getAddress(data.hits.hits[0]._source);
                newData.geo = getGeolocation(data.hits.hits[0]._source);
                newData.person = getPerson(data.hits.hits[0]._source);
                newData.title = _.get(data.hits.hits[0]._source, 'title');
                newData.publisher = _.get(data.hits.hits[0]._source, 'mainEntityOfPage.publisher.name[0]');
                newData.body = _.get(data.hits.hits[0]._source, 'mainEntityOfPage.description[0]');
                newData.prices = getPrices(data.hits.hits[0]);
                newData.emails = getEmails(data.hits.hits[0]);
                newData.phones = getPhones(data.hits.hits[0]);
                newData.sellerId = _.get(data.hits.hits[0]._source, 'seller.uri');
                newData.serviceId = _.get(data.hits.hits[0]._source, 'itemOffered.uri');
                newData.webpageId = _.get(data.hits.hits[0]._source, 'mainEntityOfPage.uri');
            }

            // aggregation data for sparklines -- currently unused
            if(data.aggregations) {
                var aggs = data.aggregations;
                newData.offersBySeller = commonTransforms.transformBuckets(aggs.offers_by_seller.buckets, 'date', 'key_as_string');
                newData.offerLocsBySeller = commonTransforms.transformBuckets(aggs.offer_locs_by_seller.buckets, 'city');
            }

            return newData;
        }
    };

})(_, commonTransforms);