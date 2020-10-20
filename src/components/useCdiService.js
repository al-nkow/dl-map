// TODO: Add select city input
const pointStorageVal = {
  cashlessOnly: "0",
  city: "Санкт-Петербург",
  cityID: 200601,
  code: "7800000000000000000000000",
  country_code: 643,
  fullName: "г. Санкт-Петербург",
  inPrice: "1",
  isAutoCity: "1",
  isTerminal: "1",
  label: "г. Санкт-Петербург",
  nameString: "Санкт-Петербург г",
  noSendDoor: "0",
  regionString: "г. Санкт-Петербург",
  street: "1",
  uString: "",
  value: "Санкт-Петербург",
};

const UseCdiService = (prevSuggestions, value) => {
  const getCityStr = (sugg) => {
    return [
      sugg.region_with_type ? sugg.region_with_type : '',
      sugg.area_with_type ? ', ' + sugg.area_with_type : '',
      sugg.city_with_type ?  ', ' + sugg.city_with_type : '',
      sugg.settlement_with_type ?  ', ' + sugg.settlement_with_type : '',
      sugg.street_with_type ?  ', ' + sugg.street_with_type : '',
      sugg.house ?  ', ' + sugg.house_type + ' ' + sugg.house : '',
      sugg.block ?  ' ' + sugg.block_type + ' ' + sugg.block : '',
      sugg.flat ?  ', ' + sugg.flat_type + ' ' + sugg.flat : ''
    ].filter(Boolean).join('')
  };

  const getQuery = () => {
    var filteredSuggestions = !!prevSuggestions && prevSuggestions.length
      ? prevSuggestions.filter((el) => {
          const locationCode =  el.settlement_kladr_id || el.city_kladr_id;
  
          return locationCode === pointStorageVal.code;
        })
      : [];
  
    var query = [];
    var filteredQuery = [];
  
    if (prevSuggestions.length
      && filteredSuggestions.length) {
        prevSuggestions.forEach(function (elem) {
          const str = [
            elem.region_with_type ? elem.region_with_type : '',
            elem.area_with_type ? elem.area_with_type : '',
            elem.city_with_type ? elem.city_with_type : '',
            elem.settlement_with_type ? elem.settlement_with_type : '',
            value
          ].filter(Boolean).join(' ');
  
          query.push(str);
        });
    } else if (prevSuggestions.length
      && !filteredSuggestions.lengt) {
        const pointStr = [
          pointStorageVal && pointStorageVal.regionString ? pointStorageVal.regionString : '',
          pointStorageVal && pointStorageVal.uString ? pointStorageVal.uString.split(',')[0] : '',
          pointStorageVal && pointStorageVal.nameString ? pointStorageVal.nameString : '',
          value
        ].filter(Boolean).join(' ');
  
        query.push(pointStr);
  
        prevSuggestions.forEach(function (elem) {
          var str = [
            elem.region_with_type ? elem.region_with_type : '',
            elem.area_with_type ? elem.area_with_type : '',
            elem.city_with_type ? elem.city_with_type : '',
            elem.settlement_with_type ? elem.settlement_with_type : '',
            value
          ].filter(Boolean).join(' ');
  
          query.push(str);
        });

    } else if (!prevSuggestions.length) {
      const pointStr = [
        pointStorageVal && pointStorageVal.regionString ? pointStorageVal.regionString : '',
        pointStorageVal && pointStorageVal.uString ? pointStorageVal.uString.split(',')[0] : '',
        pointStorageVal && pointStorageVal.fullName ? pointStorageVal.fullName : '',
        value
      ].filter(Boolean).join(' ');
  
      query.push(pointStr);
    }
  
    query.forEach(function (el) {
      if (filteredQuery.indexOf(el) === -1) {
        filteredQuery.push(el);
      }
    })
  
    return filteredQuery;
  };

  return { getQuery, getCityStr };
}

export default UseCdiService;