import Firecrawl, {CrawlParams, CrawlScrapeOptions} from '@mendable/firecrawl-js';
import {ExtractParams} from "@mendable/firecrawl-js/src";

async function main() {
  const url = `https://www.behatsdaa.org.il/card/shops?walletId=3281`;

  const apiKey = "fc-fa4ac76e6f1e46fab775109669a5205d";
  const firecrawl = new Firecrawl({apiKey: apiKey});

  const cookie = `visid_incap_1893044=XhCxe/cOQuaz0pxIE1OJqlZ5/mgAAAAAQUIPAAAAAAC+mzLUOLIhK1z6vYnK/lDf; incap_ses_253_1893044=kIfjKFRoqgTFrrX7k9aCA1Z5/mgAAAAAAUAWxb0naw1Zmy13RqS4Xw==; f5persist=3810008492.47873.0000; _fbp=fb.2.1761507672540.26822310157451437; glassix-visitor-id-v2-7a3c567f-cbab-40a0-91e1-47e407e77ee8=5b6cc9cf-f3dc-4ba4-a39f-92a2a4b36045; .AspNetCore.Session=CfDJ8LOItZWYmKJLnIgegQqKtEYFd5kT0RCkv9bKs6j4dF7GVN34R227rS1Reo73ywMUALVtI5ytu0O%2FBeEMcZ2o0bja1hCusn8al3Xsa%2BKzgSY3Haea%2BXce8jpbAnRiQE5xNw9dg%2BNu66vUGtK0GXL0Ewq5X53V5XRuKFqPRBwrVWCU; _gcl_au=1.1.741621738.1761507702; _ga=GA1.1.141389940.1761507702; _hjSessionUser_1169725=eyJpZCI6Ijk0YWE3MGJhLTM3NDgtNTY3NS1hNzBhLTYwNzYwMzA5YTBjYSIsImNyZWF0ZWQiOjE3NjE1MDc3MDI1ODIsImV4aXN0aW5nIjp0cnVlfQ==; _hjSession_1169725=eyJpZCI6IjZlMTI4YzcyLTAzMDktNGIyYy1hMGNlLWE0Mzk5NjNjZmMwZiIsImMiOjE3NjE1MDc3MDI1ODIsInMiOjEsInIiOjAsInNiIjowLCJzciI6MCwic2UiOjAsImZzIjoxLCJzcCI6MH0=; _ga_ZCYS13SRD6=GS2.1.s1761507695$o1$g1$t1761508728$j60$l0$h0; AccessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjMyMjY1NjcyOSIsImV4cCI6MTc2MTUxMDUyOSwiaXNzIjoiaHR0cHM6Ly9iYWNrLmJlaGF0c2RhYS5vcmcuaWwvIiwiYXVkIjoiaHR0cHM6Ly9iYWNrLmJlaGF0c2RhYS5vcmcuaWwvIn0.B4b0xI-SjQv4ymh9dPwDVkfitED3KLuPs43O-0ujPNg`;

  const options: ExtractParams = {
    scrapeOptions: {
      headers: {
        cookie
      }
    },
    prompt: "Extract all retailers"
  }

  const res = await firecrawl.extract([url], options)
  console.log(res);
}
main();