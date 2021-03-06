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

/* globals DigBehaviors */
/* exported DigBehaviors */
var DigBehaviors = DigBehaviors || {};

/**
 * Polymer behavior for DIG data type-specific utility functions.
 */
DigBehaviors.TypeBehavior = {
  /**
   * Returns the link for the given type and id.
   */
  getPageLink: function(id, type) {
    if(!id || !type || !(type === 'cache' || type === 'email' || type === 'image' || type === 'location' || type === 'offer' || type === 'phone' || type === 'social' || type === 'review')) {
      return undefined;
    }

    var linkId = id;
    if(linkId.indexOf('http://dig.isi.edu/ht/data/') === 0) {
      linkId = decodeURIComponent(linkId.substring(linkId.lastIndexOf('/') + 1));
    }
    if(type === 'email' || type === 'image' || type === 'social') {
      linkId = encodeURIComponent(linkId);
    }
    return '/' + type + '.html?id=' + linkId;
  },

  /**
   * Returns the iron icon string for the given type.
   */
  getTypeIcon: function(type) {
    switch(type) {
      case 'cache': return 'icons:cached';
      case 'date': return 'icons:date-range';
      case 'email': return 'communication:email';
      case 'image': return 'image:photo-camera';
      case 'location': return 'communication:location-on';
      case 'price': return 'editor:monetization-on';
      case 'offer': return '';
      case 'phone': return 'communication:phone';
      case 'provider': return 'icons:account-circle';
      case 'review': return 'icons:star';
      case 'service': return 'icons:work';
      case 'social': return 'social:public';
      case 'website': return 'av:web';
    }
    return '';
  },

  /**
   * Returns the name for the given type.
   */
  getTypeName: function(type, plural) {
    switch(type) {
      case 'cache': return 'Cached Webpage' + (plural ? 's' : '');
      case 'date': return 'Date' + (plural ? 's' : '');
      case 'email': return 'Email Address' + (plural ? 'es' : '');
      case 'image': return 'Image' + (plural ? 's' : '');
      case 'location': return 'Location' + (plural ? 's' : '');
      case 'price': return 'Price' + (plural ? 's' : '');
      case 'offer': return 'Ad' + (plural ? 's' : '');
      case 'phone': return 'Telephone Number' + (plural ? 's' : '');
      case 'provider': return 'Provider' + (plural ? 's' : '');
      case 'review': return 'Review ID' + (plural ? 's' : '');
      case 'service': return 'Service' + (plural ? 's' : '') + ' Provided';
      case 'similarImage': return 'Similar Image' + (plural ? 's' : '');
      case 'social': return 'Social Media ID' + (plural ? 's' : '');
      case 'website': return 'Website' + (plural ? 's' : '');
    }
    return '';
  },

  /**
   * Returns the style class for the given type.
   */
  getTypeStyleClass: function(type) {
    if(!type) {
      return '';
    }
    switch(type) {
      case 'date': return 'entity-deep-purple';
      case 'email': return 'entity-indigo';
      case 'image': return 'entity-light-blue';
      case 'location': return 'entity-orange';
      case 'offer': return '';
      case 'phone': return 'entity-purple';
      case 'price': return 'entity-green';
      case 'provider': return 'entity-teal';
      case 'review': return 'entity-yellow';
      case 'service': return 'entity-brown';
      case 'social': return 'entity-red';
      case 'website': return 'entity-light-green';
    }
    return 'entity-grey';
  }
};
