var Filters;

Filters = function() {
  var that;
  that = this;
  this.draw = function(selector, btnSelector) {
    var filters, i;
    i = 0;
    console.log(btnSelector);
    $(selector).html("");
    filters = ich.search({}, true);
    _.each(this.fields, function(field, index) {
      field.label = (field.label !== undefined ? field.label : index);
      field.id = "field-" + i;
      filters += ich.select(field, true);
      return i++;
    });
    filters += ich.submitBtns({}, true);
    ich.accordion({
      sections: [
        {
          id: "tabs",
          open: "in",
          title: "Type of Care",
          content: ich.tabs({
            tabs: this.tabs
          }, true)
        }, {
          id: "advanced",
          collapsed: "collapsed",
          title: "Advanced Filters",
          content: filters
        }
      ]
    }).appendTo(selector);
    $(selector + " #field-search").bind("change", this.constructQuery);
    $(selector + " .btn").bind("click", this.constructQuery);
    $(selector + " select").selectpicker().bind("change", this.constructQuery);
    $(selector + " #tabs a").bind("click", function() {
      $(selector + " #tabs a").removeClass("active");
      $(this).addClass("active");
      activeTab = $(this).attr("rel");
      that.constructQuery();
      return false;
    });
    $(btnSelector).bind("click", function() {
      $(this).toggleClass("active");
      return $("body").toggleClass("right-sidebar-active");
    });
    if (window.responsive !== "mobile") {
      $("body").addClass("right-sidebar-active");
      return $(btnSelector).addClass("active");
    }
  };
  this.constructQuery = function() {
    var i, val, values;
    i = 0;
    values = {};
    if ((typeof activeTab !== "undefined" && activeTab !== null) && activeTab !== "All Types") {
      values["Services Provided"] = _.filter(this.tabs, function(tab) {
        return tab.title === activeTab;
      })[0].services;
    }
    val = $("#field-search").val();
    if (val != null) {
      values["search"] = val;
    }
    _.each(that.fields, function(field, index) {
      val = $("#field-" + i).val();
      if (val != null) {
        values[index] = val;
      }
      return i++;
    });
    console.log(values);
    return query.constructActive(values);
  };
  this.tabs = [
    {
      title: "All Types",
      color: "orange",
      icon: "icon-alltypes",
      services: []
    }, {
      title: "General Health",
      color: "green",
      icon: "icon-generalhealth",
      services: ["Primary Health Care", "Women's Health", "Children's Health", "Adolescent Care", "Immunizations", "Chronic Disease Mgmt", "STI Testing, Treatment, & Prevention", "HIV/AIDS Treatment & Care", "Health Care for Military Veterans", "LGBT Health Services"]
    }, {
      title: "Mental / Behavioral",
      color: "purple",
      icon: "icon-alltypes",
      services: ["Substance Abuse Treatment", "Mental/Behavioral Health Care"]
    }, {
      title: "Access Assistance",
      color: "red",
      icon: "icon-mentalbehavioural",
      services: ["Case Management", "Chronic Disease Mgmt", "Medicaid Enrollment", "Connect for Health Colorado Enrollment Assistance"]
    }, {
      title: "Oral / Dental",
      color: "blue",
      icon: "icon-dentaloral",
      services: ["Dental Care"]
    }, {
      title: "Disability & Elder Care",
      color: "darkblue",
      icon: "icon-disability",
      services: ["Health Care for Disabilities or Special Needs", "Adult Day Services", "Respite Care"]
    }, {
      title: "Other",
      color: "cadetblue",
      icon: "icon-other",
      services: ["Vision Care", "Other"]
    }
  ];
  this.fields = {
    "Safety-Net Type": {
      type: "select",
      msg: "Select type of care",
      startCol: "Y",
      options: ["Community Health Center (CHC) / Federally Qualified Health Center (FQHC)", "Community-funded Safety Net Clinic (CSNC)", "Local Public Health Department and Public Nursing Services", "Rural Health Clinics (RHC)", "School-based Health Center (SBHC)", "Human/Social Services Agency", "Certified Medicaid/CHP+ Application Assistance Site", "Connect for Health Colorado Assistance Site", "WIC Clinic Site", "HCP Pediatric Specialty Clinics", "Planned Parenthood Clinic", "Veteran's Association Health Center", "Community Mental Health Clinic", "Community-based Dental Clinic", "Community-based Vision Clinics", "Critical Access Hospital", "Emergency Department", "CICP Provider", "Community Centered Boards (CCB)", "Residency Program", "Voluntary Health Organization ", "Migrant Health Center", "Refugee Health Site", "Certified Center for Independent Living", "AIDS Service Organization (ASO)", "Other Community-based Clinic", "Other Dental Clinic", "Other Mental Health Clinic", "Other Community-based Organization"]
    },
    "Services Provided": {
      type: "select",
      msg: "Select services",
      startCol: "AZ",
      options: ["Primary Health Care", "Dental Care", "Vision Care", "Mental/Behavioral Health Care", "Women's Health", "Children's Health", "Adolescent Care", "Adult Day Services", "Respite Care", "Substance Abuse Treatment", "Case Management", "Chronic Disease Mgmt", "HIV/AIDS Treatment & Care", "STI Testing, Treatment, & Prevention", "Health Care for Military Veterans", "Health Care for Disabilities or Special Needs", "LGBT Health Services", "Immunizations", "Medicaid Enrollment", "Connect for Health Colorado Enrollment Assistance", "Other"]
    },
    "Age Groups Served": {
      type: "select",
      msg: "Select age groups",
      startCol: "BU",
      options: ["Infants (0-3)", "Children (3+)", "Teens (13+)", "Adults (18+)", "Elderly (65+)"]
    },
    "Populations Served (Specialization)": {
      label: "Populations Served",
      type: "select",
      msg: "Select a specialization",
      startCol: "BZ",
      options: ["Migrant Farmworkers", "Homeless", "LGBT", "Refugee", "American Indian", "Military Veterans", "HIV/AIDS", "Disability & Special Needs", "Rural", "Other"]
    },
    "Languages Spoken": {
      type: "select",
      msg: "Select specific populations",
      startCol: "CJ",
      options: ["Spanish", "German", "French", "Vietnamese", "Korean", "Chinese", "Arabic", "Phone Translation Services", "Other"]
    },
    "Payment Assistance & Special Accommodations": {
      type: "select",
      msg: "Select one",
      startCol: "CS",
      options: ["Sliding Scale for Primary Care", "Cash/Time of Service Discount", "CICP Services", "Medicaid/CHP+ Accepted", "Other Discount Services", "Open Late / Weekends", "Other ?"]
    }
  };
  this.displayFields = [
    {
      label: "Hours",
      col: "Hours",
      primary: true
    }, {
      label: "Services",
      col: "Services Provided",
      primary: true
    }, {
      label: "Ages Served",
      col: "Age Groups Served"
    }, {
      label: "Pop. Served",
      col: "Populations Served (Specialization)"
    }, {
      label: "Languages",
      col: "Languages Spoken"
    }, {
      label: "Sponsor",
      col: "Sponsor Name"
    }
  ];
  return this;
};

/*
//@ sourceMappingURL=filters.js.map
*/