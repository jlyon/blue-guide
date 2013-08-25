
`googleQuery = new GoogleSpreadsheetsQuery(filters, function(data) {
  locache.set("blueGuideData", data);
  query = new JsonQuery("body", data);
});`
googleQuery.get "select *"