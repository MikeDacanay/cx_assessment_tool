#!/usr/bin/ruby -w
require File.expand_path('../../lib/PDFreactor.rb',  __FILE__)
require "erb"
include ERB::Util

# The content to render
content = IO.readlines(File.expand_path('../../../resources/contentRuby.html',  __FILE__)).join

# Create new PDFreactor instance
# pdfReactor = PDFreactor.new("http://yourServer:9423/service/rest")
pdfReactor = PDFreactor.new()

# Get the current URL path
path = ENV["REQUEST_URI"]
# If the first environment variable does not exist
if (path == nil)
    # try another variable.
    path = ENV["SCRIPT_NAME"]
end

# Create a new PDFreactor configuration object
config = {
    # Specify the input document
    document: content,
    # Set a base URL for images, style sheets, links
    baseURL: "http://" + ENV["HTTP_HOST"] + path,
    # Set an appropriate log level
    logLevel: PDFreactor::LogLevel::WARN,
    # Set the title of the created PDF
    title: "Demonstration of the PDFreactor Ruby API",
    # Set the author of the created PDF
    author: "Myself",
    # Enable links in the PDF document
    addLinks: true,
    # Enable bookmarks in the PDF document
    addBookmarks: true,
    # Set some viewer preferences
    viewerPreferences: [
        PDFreactor::ViewerPreferences::FIT_WINDOW,
        PDFreactor::ViewerPreferences::PAGE_MODE_USE_THUMBS
    ],
    # Add user style sheets
    userStyleSheets: [
        {
            content: "@page {"\
                         "@top-center {"\
                             "content: 'PDFreactor Ruby API demonstration';"\
                         "}"\
                         "@bottom-center {"\
                             "content: 'Created on "+Time.now.strftime("%m/%d/%Y %H:%M:%S %p")+"';"\
                         "}"\
                     "}"
        },
        { uri: "../../resources/common.css" }
    ]
}

begin
    # Sync
    file1 = File.open("stream-sync.pdf", 'w')
    pdfReactor.convertAsBinary(config, file1);

    # Async
    documentId = pdfReactor.convertAsync(config);

    loop do
        progress = pdfReactor.getProgress(documentId)
        break if progress["finished"]
        sleep(0.5)
    end

    file2 = File.open("stream-async.pdf", 'w')
    pdfReactor.getDocumentAsBinary(documentId, file2);

    print "Content-type: text/html\n\n"
    puts "<h1>2 files successfully written: 'stream-sync.pdf' and 'stream-async.pdf'. Please check your file system.</h1>"
rescue Exception => error
    print "Content-type: text/html\n\n"
    puts "<h1>An Error Has Occurred</h1>"
    puts "<h2>#{error}</h2>"
end
