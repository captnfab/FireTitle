function computeTitle(pattern, separator, name, origTitle, nbtab, browserInfo)
{
  var title = "";
  var nosepid = [];

  for (var i = 0; i < pattern.length; i++)
  {
    var match = null;
    // If an integer prefix is found, the next string is truncated in length
    // at this value.
    var limiter = 0;
    switch(pattern.charAt(i))
    {
      case 'm':
        // Browser name
        match = browserInfo.vendor + " " + browserInfo.name; // "Mozilla Firefox";
        // var gettingInfo = browser.runtime.getBrowserInfo()
        break;
      case 'v':
        // Browser's Version
        match = browserInfo.version;
        break;
      case 'b':
        // Browser's build ID
        match = browserInfo.buildID;
        break;
      case 'n':
        // Window's Name
        match = name;
        break;
      case 't':
        // Title
        match = origTitle;
        break;
      case 'T':
        // Number of tabs
          match = nbtab;
          break;
        /*
      case 'g':
        // Group name
        match = this.getActiveGroupName();
        if(!match) continue;
        break;
        */

      case '[':
        // Text inside [ ] is copied. ] is escaped with ]]
        var i0 = ++i;
        var i1 = 0;
        while(i < pattern.length && !i1)
        {
          if(pattern.charAt(i) == ']')
          {
            if(pattern.length >= i && pattern.charAt(i+1) == ']')
              i++
            else
              i1 = --i;
          }
          i++;
        }
        if(!i1) i1 = i -1;
        match = pattern.substr(i0, (i1-i0+1))
        nosepid.push(i+1);
        break;
      default:
        match = "";
    }
    while((i + 1 < pattern.length) && (pattern.charAt(i+1) >= '0') && (pattern.charAt(i+1) <= '9'))
    {
      limiter = 10 * limiter + (pattern.charAt(i+1) - '0');
      i++;
    }
    if(limiter)
    {
      match = match.substr(0, limiter);
    }
    title = match ? (title ? title + (nosepid.indexOf(i)>=0?"":separator) + match : match) : title;
  }
  return title;
}

function onError(error) {
  debugInfo(2, error);
}

function debugInfo(level, info)
{
  // false: debugging disabled for releases
  // (might be configurable in the options if users ask for it)
  var debug=false;
  // Minimum verbosity level
  // 0: info, 1: warning, 2: failure, 3: debug only
  var debuglevel=2;

  if(debug && level>= debuglevel)
  {
    var output = "";
    switch(level)
    {
      case 0:
        output = "[Info] " + error;
        break;
      case 1:
        output = "[Warn] " + error;
        break;
      case 2:
        output = "[Fail] " + error;
        break;
      default:
        output = "[Debug] " + error;
        break;
    }
    console.log(output);
  }
}
