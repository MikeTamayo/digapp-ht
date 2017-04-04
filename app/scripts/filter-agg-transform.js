/*
 * Copyright 2017 Next Century Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * transform elastic search filter aggregations to display format.
 */

/* exported filterAggTransform */
/* jshint camelcase:false */

var filterAggTransform = (function() {

  function getCityText(id) {
    var idList = id.split(':');
    return idList[0] + ', ' + idList[1];
  }

  function getEmailText(id) {
    return decodeURIComponent(id.substring(id.lastIndexOf('/') + 1));
  }

  function getPhoneText(id) {
    var text = id.substring(id.lastIndexOf('/') + 1);
    if(text.indexOf('-') >= 0) {
      return text.substring(text.indexOf('-') + 1);
    }
    return text;
  }

  return {
    cityList: function(data, property) {
      if(data && data.aggregations && data.aggregations[property] && data.aggregations[property][property] && data.aggregations[property][property].buckets) {
        return data.aggregations[property][property].buckets.map(function(bucket) {
          /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
          return {
            count: bucket.doc_count,
            id: bucket.key,
            text: getCityText(bucket.key)
          };
          /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */
        }).filter(function(object) {
          return object.id;
        });
      }
      return [];
    },

    emailList: function(data, property) {
      if(data && data.aggregations && data.aggregations[property] && data.aggregations[property][property] && data.aggregations[property][property].buckets) {
        return data.aggregations[property][property].buckets.map(function(bucket) {
          /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
          return {
            count: bucket.doc_count,
            id: bucket.key,
            text: getEmailText(bucket.key)
          };
          /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */
        });
      }
      return [];
    },

    phoneList: function(data, property) {
      if(data && data.aggregations && data.aggregations[property] && data.aggregations[property][property] && data.aggregations[property][property].buckets) {
        return data.aggregations[property][property].buckets.map(function(bucket) {
          /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
          return {
            count: bucket.doc_count,
            id: bucket.key,
            text: getPhoneText(bucket.key)
          };
          /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */
        });
      }
      return [];
    },

    filterList: function(data, property) {
      if(data && data.aggregations && data.aggregations[property] && data.aggregations[property][property] && data.aggregations[property][property].buckets) {
        return data.aggregations[property][property].buckets.map(function(bucket) {
          /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
          return {
            count: bucket.doc_count,
            id: bucket.key
          };
          /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */
        });
      }
      return [];
    },

    cityText: function(id) {
      return getCityText(id);
    },

    emailText: function(id) {
      return getEmailText(id);
    },

    phoneText: function(id) {
      return getPhoneText(id);
    }
  };
});
