Filters = ->
  that = this
  @draw = (selector, btnSelector) ->
    i = 0
    #var $selector = $(selector);
    $(selector).html ""
    filters = ich.search({}, true)
    _.each @fields, (field, index) ->
      field.label = (if field.label isnt `undefined` then field.label else index)
      field.id = "field-" + i
      filters += ich.select(field, true)
      i++
    filters += ich.submitBtns({}, true)

    ich.accordion(sections: [
      id: "tabs"
      open: "in"
      title: "Type of Care"
      content: ich.tabs(
        tabs: @tabs
      , true)
    ,
      id: "advanced"
      collapsed: "collapsed"
      title: "Advanced Filters"
      content: filters
    ]).appendTo selector

    # Update events for search field, buttons, selects
    $(selector + " #field-search").bind "change", @constructQuery
    $(selector + " .btn:not(#reset)").bind "click", @constructQuery
    $(selector + " select").selectpicker().bind "change", @constructQuery
    $(selector + " #reset").bind "click", ->
      $(selector + " #field-search").val ""
      $(selector + " select").selectpicker "val", ""
      false

    # Click events for "tabs"
    $(selector + " #tabs a").bind "click", ->
      $(selector + " #tabs a").removeClass "active"
      $(this).addClass "active"
      `activeTab = $(this).attr("rel")`
      that.constructQuery()
      false

    # Click event for "Show Filters" btn
    $(btnSelector).bind "click", ->
      $(this).toggleClass "active"
      $("body").toggleClass "right-sidebar-active"
    if window.responsive isnt "mobile"
      $("body").addClass "right-sidebar-active" 
      $(btnSelector).addClass "active"


  @constructQuery = ->
    i = 0
    values = {}
    # Add services (from tabs)
    if activeTab? and activeTab isnt "All Types"
      values["Services Provided"] = _.filter(@tabs, (tab) ->
        tab.title is activeTab
      )[0].services
    
    # Add search
    val = $("#field-search").val()
    values["search"] = val if val?

    # Add select fields
    _.each that.fields, (field, index) ->
      val = $("#field-" + i).val()
      values[index] = val if val?
      i++
    
    console.log values
    query.constructActive values

  @tabs = [
    title: "All Types"
    color: "orange"
    icon: "icon-alltypes"
    services: []
  ,
    title: "General Health"
    color: "green"
    icon: "icon-generalhealth"
    services: ["Primary Health Care", "Women's Health", "Children's Health", "Adolescent Care", "Immunizations", "Chronic Disease Mgmt", "STI Testing, Treatment, & Prevention", "HIV/AIDS Treatment & Care", "Health Care for Military Veterans", "LGBT Health Services"]
  ,
    title: "Mental / Behavioral"
    color: "purple"
    icon: "icon-alltypes"
    services: ["Substance Abuse Treatment", "Mental/Behavioral Health Care"]
  ,
    title: "Access Assistance"
    color: "red"
    icon: "icon-mentalbehavioural"
    services: ["Case Management", "Chronic Disease Mgmt", "Medicaid Enrollment", "Connect for Health Colorado Enrollment Assistance"]
  ,
    title: "Oral / Dental"
    color: "blue"
    icon: "icon-dentaloral"
    services: ["Dental Care"]
  ,
    title: "Disability & Elder Care"
    color: "darkblue"
    icon: "icon-disability"
    services: ["Health Care for Disabilities or Special Needs", "Adult Day Services", "Respite Care"]
  ,
    title: "Other"
    color: "cadetblue"
    icon: "icon-other"
    services: ["Vision Care", "Other"]
  ]
  @fields =
    "Safety-Net Type":
      type: "select"
      msg: "Select type of care"
      startCol: "Y"
      options: ["Community Health Center (CHC) / Federally Qualified Health Center (FQHC)", "Community-funded Safety Net Clinic (CSNC)", "Local Public Health Department and Public Nursing Services", "Rural Health Clinics (RHC)", "School-based Health Center (SBHC)", "Human/Social Services Agency", "Certified Medicaid/CHP+ Application Assistance Site", "Connect for Health Colorado Assistance Site", "WIC Clinic Site", "HCP Pediatric Specialty Clinics", "Planned Parenthood Clinic", "Veteran's Association Health Center", "Community Mental Health Clinic", "Community-based Dental Clinic", "Community-based Vision Clinics", "Critical Access Hospital", "Emergency Department", "CICP Provider", "Community Centered Boards (CCB)", "Residency Program", "Voluntary Health Organization ", "Migrant Health Center", "Refugee Health Site", "Certified Center for Independent Living", "AIDS Service Organization (ASO)", "Other Community-based Clinic", "Other Dental Clinic", "Other Mental Health Clinic", "Other Community-based Organization"]

    "Services Provided":
      type: "select"
      msg: "Select services"
      startCol: "AZ"
      options: ["Primary Health Care", "Dental Care", "Vision Care", "Mental/Behavioral Health Care", "Women's Health", "Children's Health", "Adolescent Care", "Adult Day Services", "Respite Care", "Substance Abuse Treatment", "Case Management", "Chronic Disease Mgmt", "HIV/AIDS Treatment & Care", "STI Testing, Treatment, & Prevention", "Health Care for Military Veterans", "Health Care for Disabilities or Special Needs", "LGBT Health Services", "Immunizations", "Medicaid Enrollment", "Connect for Health Colorado Enrollment Assistance", "Other"]

    "Age Groups Served":
      type: "select"
      msg: "Select age groups"
      startCol: "BU"
      options: ["Infants (0-3)", "Children (3+)", "Teens (13+)", "Adults (18+)", "Elderly (65+)"]

    "Populations Served (Specialization)":
      label: "Populations Served"
      type: "select"
      msg: "Select a specialization"
      startCol: "BZ"
      options: ["Migrant Farmworkers", "Homeless", "LGBT", "Refugee", "American Indian", "Military Veterans", "HIV/AIDS", "Disability & Special Needs", "Rural", "Other"]

    "Languages Spoken":
      type: "select"
      msg: "Select specific populations"
      startCol: "CJ"
      options: ["Spanish", "German", "French", "Vietnamese", "Korean", "Chinese", "Arabic", "Phone Translation Services", "Other"]

    "Payment Assistance & Special Accommodations":
      type: "select"
      msg: "Select one"
      startCol: "CS"
      options: ["Sliding Scale for Primary Care", "Cash/Time of Service Discount", "CICP Services", "Medicaid/CHP+ Accepted", "Other Discount Services", "Open Late / Weekends", "Other ?"]

  @displayFields = [
    label: "Hours"
    col: "Hours"
    primary: true
  ,
    label: "Services"
    col: "Services Provided"
    primary: true
  ,
    label: "Ages Served"
    col: "Age Groups Served"
  ,
    label: "Pop. Served"
    col: "Populations Served (Specialization)"
  ,
    label: "Languages"
    col: "Languages Spoken"
  ,
    label: "Sponsor"
    col: "Sponsor Name"
  ]

  return @