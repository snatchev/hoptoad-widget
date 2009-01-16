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

ENV["SUBDOMAIN"] = "fnando"
ENV["API_KEY"] = "6d165a6b1ca34e7c76374be75221ff930bd6cb96"

ht = HopToad.new

if ht.authorized?
  xml = REXML::Document.new(ht.load)
  
  if xml.elements.to_a("groups/group").size.zero?
    contents = "no-results"
  else
    contents = ""

    xml.elements.each("groups/group") { |group|
      message     = group.elements["error-message"].text.to_s.gsub(/</, '&lt;').gsub(/>/, '&gt;')
      count       = group.elements["notices-count"].text.to_i
      most_recent = Time.parse(group.elements["most-recent-notice-at"].text)
      id          = group.elements["id"].text.to_i
    
      contents << %(
        <p onclick="widget.openURL('http://#{ht.subdomain}.hoptoadapp.com/errors/#{id}');" title="Go to HopToad" id="exception-#{id}" class="exception">
          <strong>#{count}</strong>
          <a>#{message}</a>
          <span class="timeago">
            ~ <abbr title="#{most_recent.utc.strftime("%FT%T%z")}">#{most_recent.strftime("%b %d, %Y ~ %I:%M%p")}</abbr>
          </span>
        </p>
      )
    }
  end
  
  puts contents
end