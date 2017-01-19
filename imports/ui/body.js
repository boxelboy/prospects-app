// disconnecting from server
Meteor.disconnect();

import { Template } from 'meteor/templating';

import { Prospects } from '../api/prospects.js';
 
import { Settings } from '../api/prospects.js';

import './body.html';

const port = 9191;
// this is only used when testing what happens when there isn't a connection to the network
const badport = 9292;

// setting 'add prospects' form as default on login
Session.setDefault('page', 'add');

// bit of a hack in case this is the first time the app is ran on a mobile device
if (Settings.find().count() === 0) {
  Settings.insert({_id: "1", user: "", pwd: "", server: ""});
}

myAlert = function(txt) {
  console.log(txt);
};

sendStuff =  function() {
  _.each(Prospects.find().fetch(), _.bind(function (prospect) {
    myAlert('send func - prospct:', prospect);
    var prospectObj = {
      id: prospect._id,
      title: prospect.title,
      firstName: prospect.firstName,
      lastName: prospect.lastName,
      class: prospect.classification,
      company: prospect.name,
      website: prospect.website,
      email: prospect.email,
      phone: prospect.phone,
      street: prospect.mainAddressStreet,
      town: prospect.mainAddressTown,
      postcode: prospect.mainAddressPostcode,
      country: prospect.mainAddressCountry,
      nextStep: prospect.nextstage,
      rating: Number(prospect.rating),
      dueDate: prospect.duedate,
      source: prospect.source,
      manager: prospect.manager,
      notes: prospect.notes
    };
     myAlert('send func', prospectObj);
  }, this));
};

$('#spinner').hide();

// creating a web worker to use thread to send data to server every 2 mins once a network connection has been re-established
var w = new Worker("./send.js");

// setting up body helpers
Template.body.helpers({
  prospects() {
    return Prospects.find({}, {sort: { createdAt: -1 } });
  },
  setting() {
    return Settings.findOne();
  },
  getProspect() {
    return Prospects.findOne({_id: Session.get('id')});
  },
  settings() {
    return Settings.find();
  },
  isPage: function(page) {
    return Session.equals('page', page);
  },
  isID: function() {
    return Session.get('id');
  }

});

// setting up helpers for the login template - slight fudge
Template.loginForm.helpers({
  setting() {
    return Settings.findOne();
  }
});

// setting up helpers for the login template - slight fudge
Template.listProspects.helpers({
  setting() {
    return Settings.findOne();
  }
});

// setting up helpers for the menu template
Template.menu.helpers({
  isPage: function(page) {
    return Session.equals('page', page);
  },
    setting() {
    return Settings.findOne();
  }
});

// setting up form helpers
Template.prospectsForm.helpers({
  prospects() {
    return Prospects.find({}, {sort: { createdAt: -1 } });
  },
  setting() {
    return Settings.findOne();
  },
  getProspect() {
    return Prospects.findOne({_id: Session.get('id')});
  },
  send: function() {
    w.onmessage = function(event) {
      var settings = Settings.findOne({_id: '1'});
      if (event.data === "send") {
          _.each(Prospects.find().fetch(), _.bind(function (prospect) {
              var prospectObj = JSON.stringify({
                title: prospect.title,
                firstName: prospect.firstName,
                lastName: prospect.lastName,
                class: prospect.classification,
                company: prospect.name,
                website: prospect.website,
                email: prospect.email,
                phone: prospect.phone,
                street: prospect.mainAddressStreet,
                town: prospect.mainAddressTown,
                postcode: prospect.mainAddressPostcode,
                country: prospect.mainAddressCountry,
                nextStep: prospect.nextstage,
                rating: Number(prospect.rating),
                dueDate: prospect.duedate,
                source: prospect.source,
                manager: settings.user
              });

              $.ajax({
                type: 'POST',
                contentType: 'application/json',
                url: settings.server + '/api/BusinessMan/prospects',
                dataType: 'json',
                data: prospectObj,
                success: function(data) {
                  var noteObj = JSON.stringify({
                    prospect: data.account_no,
                    keyTradingCompanyID: 'CY2007',
                    notesareaname: 'Prospects',
                    author: prospect.manager,
                    notes: prospect.notes,
                    created: moment().format('YYYY-MM-DD hh:mm:ss')
                  });
                  $.ajax({
                    type: 'POST',
                    contentType: 'application/json',
                    url: settings.server +'/api/BusinessMan/notes',
                    dataType: 'json',
                    data: noteObj,
                    success: function() {
                      Prospects.remove({_id: prospect._id});
                    }
                  });
                },
                error: function(){
                  return false;
                }
              });

          }, this));
      } else if (event.data !== "send") {
        return false;
      }
    };
  },
  isID: function() {
    return Session.get('id');
  }
});

Template.body.events({
  // hide company box if individual is chosen
  'change #form_classification'(event) {
    if (event.target.value === "Individual") {
      $('#form_name').hide();
      $('#form_name').removeAttr('required'); 
      $('#form_name').siblings('label').hide();
    } else {
      $('#form_name').show();
      $('#form_name').attr('required','required'); 
      $('#form_name').siblings('label').show();
    }
  },

  'click .showProspect'(event) {
    Session.set('id', $(event.target).attr("data-id"));
    Session.set('page', 'add');
  },

  // exit app - currently not being used but here if you want it
  'click #exit'(event) {
    event.preventDefault();
    if (Meteor.isCordova) {
      navigator.app.exitApp();
    }
  },

  // swtich between screens
  'click .menu'(event) {
    event.preventDefault();
    Session.set('page', event.target.id);
  },

  // send prospects to server
  'click #send'(event) {
    event.preventDefault();
    var settings = Settings.findOne({_id: '1'});
    if (Prospects.find().count() > 0) {
      _.each(Prospects.find().fetch(), _.bind(function (prospect) {
        var prospectObj = JSON.stringify({
          title: prospect.title,
          firstName: prospect.firstName,
          lastName: prospect.lastName,
          class: prospect.classification,
          company: prospect.name,
          website: prospect.website,
          email: prospect.email,
          phone: prospect.phone,
          street: prospect.mainAddressStreet,
          town: prospect.mainAddressTown,
          postcode: prospect.mainAddressPostcode,
          country: prospect.mainAddressCountry,
          nextStep: prospect.nextstage,
          rating: Number(prospect.rating),
          dueDate: prospect.duedate,
          source: prospect.source,
          manager: settings.user
        });

        $.ajax({
          type: 'POST',
          contentType: 'application/json',
          url: settings.server + '/api/BusinessMan/prospects',
          dataType: 'json',
          data: prospectObj,
          success: function(data) {
            var noteObj = JSON.stringify({
              prospect: data.account_no,
              keyTradingCompanyID: 'CY2007',
              notesareaname: 'Prospects',
              author: prospect.manager,
              notes: prospect.notes,
              created: moment().format('YYYY-MM-DD hh:mm:ss')
            });
            $.ajax({
              type: 'POST',
              contentType: 'application/json',
              url: settings.server + '/api/BusinessMan/notes',
              dataType: 'json',
              data: noteObj,
              success: function() {
                Prospects.remove({_id: prospect._id});
                $("header").css("background-color","#438eb9");
              }
            });
          },
          error: function(){
            $("header").css("background-color","#438eb9");
            return false;
          }
        });

      }, this));
    } else {
      //
    }
    //Session.set('page', 'add');
  },

  // list minimal prospect data stored on device
  'click #show'(event) {
    event.preventDefault();
    var server = Settings.find().fetch();
    Settings.update(server[0]._id, {$set: {user: "",pwd: ""}});
  },

// Log in user 
  'click #login'(event) {
    event.preventDefault();
    Settings.update({_id: "1"},
        {$set: {allowEntry: false}
    });    
    Session.set('page', 'login');
    //Settings.update({_id: "1"}, {$set: {user: "",pwd: ""}});

    // hack to tidy up any stray records - only really needed when testing in a browser
    var server = Settings.find().fetch();
    for (var i = 0; i < Settings.find().count(); i++)
    {
      if (server[i]._id !== "1") { Settings.remove({_id: server[i]._id}); }
    }
  },

  // log user out
  'click #logout'(event) {
    event.preventDefault();
    Settings.update({_id: "1"}, {$set: {user: "",pwd: "", allowEntry: false}});

    // hack to tidy up any stray records - only really needed when testing in a browser
    var server = Settings.find().fetch();
    for (var i = 0; i < Settings.find().count(); i++)
    {
      if (server[i]._id !== "1") { Settings.remove({_id: server[i]._id}); }
    }
  },

  'submit .cancel'(event) {
      event.preventDefault();
      Session.setDefault('page', 'add');
  },


  // log user in
  'submit .login'(event) {
    $('#spinner').show();
    event.preventDefault();
    var server = Settings.find().fetch();
    const target = event.target;
    const usr = target.user.value;
    const pass = CryptoJS.MD5(target.pwd.value).toString();
    const svr = target.server.value;

    $.ajax({
      type: 'GET',
      contentType: 'application/json',
      url: svr + '/api/BusinessMan/users?username=' + usr + '&password=' + pass,
      dataType: 'json',
      success: function(data) {
        if (data.total_items > 0) {
          Settings.update({_id: "1"},
            {$set: {user: usr, pwd: pass, server: svr, allowEntry: true}}
          );
          Session.set('page', 'add');
          $("header").css("background-color","#438eb9");
          $('#spinner').hide();
        } else {
          $('#spinner').hide();
          $("header").css("background-color","#438eb9");
          $('#message').html('Incorrect login details');
        }

      },
      // collecting everything into the function for debug purposes only
      error: function (jqXHR, textStatus, errorThrown) {
          $('#spinner').hide();

          swal({
              title: "Unable to connect to server",
              text: "Do you want to enter prospects without logging in?",
              type: "warning",   
              showCancelButton: true,   
              confirmButtonColor: "#DD6B55",   
              confirmButtonText: "Yes",   
              cancelButtonText: "No",   
              closeOnConfirm: true,   
              closeOnCancel: true }, 
                function(isConfirm){   
                    if (isConfirm) {
                        $("header").css("background-color","#ff0000");
                        Settings.update({_id: "1"},
                          {$set: {allowEntry: true}
                      });
                        Session.set('page', 'add');
                    } else {
                        Settings.update({_id: "1"},
                          {$set: {allowEntry: false}
                        });
                    }
                }
            )
      }
    });
  },

  // save new prospect - if app can't connect to the server then it will write to groundDB and turn header bar red
  'submit .new-prospect'(event) {
    var id = Session.get('id');
    event.preventDefault();
    const target = event.target;
    const title = target.title.value;
    const firstName = target.firstName.value;
    const lastName = target.lastName.value;
    const classification = target.classification.value;
    const name = target.name.value;
    const website = target.website.value;
    const email = target.email.value;
    const phone = target.phone.value;
    const mainAddressStreet = target.mainAddressStreet.value;
    const mainAddressTown = target.mainAddressTown.value;
    const mainAddressPostcode = target.mainAddressPostcode.value;
    const mainAddressCountry = target.mainAddressCountry.value;
    const rating = target.rating.value;
    const source = target.source.value;
    const nextstage = target.nextstage.value;
    const duedate = target.duedate.value;
    const notes = target.notes.value;
    var settings = Settings.findOne({_id: '1'});
    const manager = settings.user;
    console.log('manager:', manager);

    if (target.button.value === 'save') {
      var myObj = JSON.stringify({
        title: title,
        firstName: firstName,
        lastName: lastName,
        class: classification,
        company: name,
        website: website,
        email: email,
        phone: phone,
        street: mainAddressStreet,
        town: mainAddressTown,
        postcode: mainAddressPostcode,
        country: mainAddressCountry,
        rating: Number(rating),
        nextStep: nextstage,
        dueDate: duedate,
        source: source,
        manager: manager
      });   
      console.log(myObj);  

      if (!manager) {
          Prospects.insert({
            title,
            firstName,
            lastName,
            classification,
            name,
            website,
            email,
            phone,
            mainAddressStreet,
            mainAddressTown,
            mainAddressPostcode,
            mainAddressCountry,
            source,
            manager,
            rating,
            nextstage,
            duedate,
            notes,
            createdAt: new Date(),
          });
          $("header").css("background-color","#ff0000");
          swal("Prospect saved to device. Please upload later");
          $('#add-prospect').trigger('reset');

      } else {

      $.ajax({
        type: 'POST',
        contentType: 'application/json',
        url: settings.server + '/api/BusinessMan/prospects',
        dataType: 'json',
        data: myObj,
        success: function(data) {
          var noteObj = JSON.stringify({
                prospect: data.account_no,
                keyTradingCompanyID: 'CY2007',
                notesareaname: 'Prospects',
                author: manager,
                notes: notes,
                created: moment().format('YYYY-MM-DD hh:mm:ss')
              });
              $.ajax({
                type: 'POST',
                contentType: 'application/json',
                url: settings.server + '/api/BusinessMan/notes',
                dataType: 'json',
                data: noteObj,
                success: function() {
                  $("header").css("background-color","#438eb9");
                  swal("Prospect saved to server");
                }
              });
        },
        // collecting everything in the function coz you never know......
        error: function (jqXHR, textStatus, errorThrown) {
          // tihs bit below saves the prospect to groundDB....i know.....how cool is that!
          Prospects.insert({
            title,
            firstName,
            lastName,
            classification,
            name,
            website,
            email,
            phone,
            mainAddressStreet,
            mainAddressTown,
            mainAddressPostcode,
            mainAddressCountry,
            source,
            manager,
            rating,
            nextstage,
            duedate,
            notes,
            createdAt: new Date(),
          });
          $("header").css("background-color","#ff0000");
          swal("Prospect saved to device. Please upload later");
        }
    });

      // Clear form
      $('#add-prospect').trigger('reset');
    }
  } else {
    Prospects.update({_id: Session.get('id')}, {$set: {
      title: title,
      firstName: firstName,
      lastName: lastName,
      classification: classification,
      name: name,
      website: website,
      email: email,
      phone: phone,
      mainAddressStreet: mainAddressStreet,
      mainAddressTown: mainAddressTown,
      mainAddressPostcode: mainAddressPostcode,
      mainAddressCountry: mainAddressCountry,
      source: source,
      manager: manager,
      rating: rating,
      nextstage: nextstage,
      duedate: duedate,
      notes: notes
    }});
    Session.set('id', undefined);
    delete Session.keys.id;
    $('#add-prospect').trigger('reset');
    Session.set('page', 'list');
  }

  },
});