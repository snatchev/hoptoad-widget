require "open-uri"
require "cgi"
require "rexml/document"
require "uri"
require "net/http"
require "time"

class HopToad
  def url
    "http://#{subdomain}.hoptoadapp.com/errors.xml?auth_token=#{api_key}&page=#{page}"
  end
  
  def api_key
    CGI.escape ENV["API_KEY"]
  end
  
  def subdomain
    CGI.escape ENV["SUBDOMAIN"]
  end
  
  def page
    [ENV["PAGE"].to_i, 1].max.to_s
  end
  
  def load
    @load ||= open(url).read rescue nil
  end
  
  def load!
    @load = nil
    load
  end
  
  def authorized?
    !(load.to_s =~ /<!DOCTYPE html PUBLIC/m)
  end
end

ht = HopToad.new

if ht.authorized?
  xml = REXML::Document.new(ht.load)
  contents = ""

  xml.elements.each("groups/group") { |group|
    message     = group.elements["error-message"].text.to_s.gsub(/</, '&lt;').gsub(/>/, '&gt;')
    count       = group.elements["notices-count"].text.to_i
    most_recent = Time.parse(group.elements["most-recent-notice-at"].text)
    id          = group.elements["id"].text.to_i
    
    contents << %(
      <p onclick="widget.openURL('http://#{ht.subdomain}.hoptoadapp.com/errors/#{id}');" title="Go to HopToad" id="exception-#{id}" class="exception">
        <a>#{message}</a>
        <strong>#{count}</strong>
        ~ <abbr title="#{most_recent.utc.strftime("%FT%T%z")}">#{most_recent.strftime("%b %d, %Y ~ %I:%M%p")}</abbr>
      </p>
    )
  }
  
  puts contents
end