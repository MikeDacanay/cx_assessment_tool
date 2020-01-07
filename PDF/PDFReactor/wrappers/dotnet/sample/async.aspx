<%@ Page Language="C#" Debug="true" %>

<%@ import namespace="System.IO" %>
<%@ import namespace="System.Threading" %>
<%@ Import namespace="RealObjects.PDFreactor.Webservice.Client" %>



<script language="C#" runat=server>
    public string GetContent(String contentURI)
    {
        StreamReader re = File.OpenText(contentURI);
        String text = re.ReadToEnd();
        re.Close();

        return text;
    }
</script>

<%
    // Create new PDFreactor instance
    // PDFreactor pdfReactor = new PDFreactor("http://yourServer:9423/service/rest");
    PDFreactor pdfReactor = new PDFreactor();

    // URI to load document content
    String contentURI = Server.MapPath("../../resources/contentDotnet.html");

    DateTime date = System.DateTime.Now;
    String day = date.ToString("MM");
    String month = date.ToString("dd");
    String year = date.ToString("yyyy");
    String time = date.ToString("hh:mm:ss");

    // Create a new configuration object
    RealObjects.PDFreactor.Webservice.Client.Configuration config = new RealObjects.PDFreactor.Webservice.Client.Configuration();
    // Specify the input document
    config.Document = GetContent(contentURI);
    // Set a base URL for images, style sheets, links
    config.BaseURL = "http://" + Request.ServerVariables["HTTP_HOST"] + Request.ServerVariables["REQUEST_URI"];
    // Set an appropriate log level
    config.LogLevel = LogLevel.WARN;
    // Sets the title of the created PDF
    config.Title = "Demonstration of PDFreactor .NET API";
    // Sets the author of the created PDF
    config.Author = "Myself";
    // Enables links in the PDF document.
    config.AddLinks = true;
    // Enable bookmarks in the PDF document
    config.AddBookmarks = true;
    // Set some viewer preferences
    config.ViewerPreferences.Add(ViewerPreferences.FIT_WINDOW);
    config.ViewerPreferences.Add(ViewerPreferences.PAGE_MODE_USE_THUMBS);
    // Add user style sheets
    config.UserStyleSheets.Add(new Resource {
        Content = "@page {" +
                      "@top-center {" +
                          "content: 'PDFreactor .NET API demonstration';" +
                      "}" +
                      " @bottom-center {" +
                          "content: \"Created on " + day + "/" + month + "/" + year + " " + time + "\";" +
                      "}" +
                  "}"
    });
    config.UserStyleSheets.Add(new Resource {
        Uri = "../../resources/common.css"
    });

    try
    {
        // Convert document
        String documentId = pdfReactor.ConvertAsync(config);
        Progress progress;

        do
        {
            Thread.Sleep(500);
            progress = pdfReactor.GetProgress(documentId);
        } while (!progress.Finished);

        Result result = pdfReactor.GetDocument(documentId);

        Response.ContentType = "application/pdf";
        Response.BinaryWrite(result.Document);
    }
    catch (Exception e)
    {
        // catch PDFreactorWebserviceException in production instead
        Response.Write("<h1>An Error Has Occurred</h1>");
        Response.Write("<h2>" + e.Message + "</h2>");
    }
%>
