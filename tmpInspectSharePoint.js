const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8').split(/\r?\n/).reduce((acc, line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) acc[match[1]] = match[2];
  return acc;
}, {});
(async () => {
  const tenant = env.AZURE_AD_TENANT_ID;
  const clientId = env.AZURE_AD_CLIENT_ID;
  const clientSecret = env.AZURE_AD_CLIENT_SECRET;
  const siteId = env.NEXT_PUBLIC_SHAREPOINT_SITE_ID;
  const listId = env.NEXT_PUBLIC_SHAREPOINT_LIST_ID;
  if (!tenant || !clientId || !clientSecret || !siteId || !listId) {
    console.error('Missing env values');
    process.exit(1);
  }
  const tokenRes = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    }).toString(),
  });
  const tokenData = await tokenRes.json();
  const token = tokenData.access_token;
  const listUrl = `https://graph.microsoft.com/v1.0/sites/${encodeURIComponent(siteId)}/lists/${encodeURIComponent(listId)}/items?$expand=fields&$top=5`;
  const res = await fetch(listUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json();
  console.log(JSON.stringify(data.value.map(item => ({id: item.id, fields: item.fields})), null, 2));
})();
