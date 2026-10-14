import { describe, expect, it } from "vitest";

import {
  classifyContactMessage,
  resolveSiteIdentity,
  siteIdentity,
} from "./contact-spam";

const site = siteIdentity("https://maestrofelipemagalhaes.com");

function verdict(email: string, subject: string, message: string) {
  return classifyContactMessage({ email, subject, message }, site);
}

describe("siteIdentity", () => {
  it("takes the brand from the production URL", () => {
    expect(site).toEqual({
      host: "maestrofelipemagalhaes.com",
      brand: "maestrofelipemagalhaes",
    });
  });

  it("ignores www and refuses what it cannot use", () => {
    expect(siteIdentity("https://www.maestrofelipemagalhaes.com")?.host).toBe(
      "maestrofelipemagalhaes.com",
    );
    expect(siteIdentity(undefined)).toBeNull();
    expect(siteIdentity("not a url")).toBeNull();
    // Too short to search for inside other domains.
    expect(siteIdentity("https://art.com")).toBeNull();
  });

  // Found on the local replica: NEXT_PUBLIC_SITE_URL was localhost there, so
  // the lookalike rule compared the scam against "localhost" and let it in.
  it("never takes a local address for the site", () => {
    expect(siteIdentity("http://localhost:3000")).toBeNull();
    expect(siteIdentity("http://127.0.0.1:3100")).toBeNull();
    expect(siteIdentity("http://admin.localhost")).toBeNull();
  });

  it("falls back to the canonical domain when nothing usable is configured", () => {
    expect(
      resolveSiteIdentity("http://localhost:3000", "https://localhost:3100")
        ?.host,
    ).toBe("maestrofelipemagalhaes.com");
    expect(resolveSiteIdentity(undefined, null)?.host).toBe(
      "maestrofelipemagalhaes.com",
    );
  });
});

describe("the spam production received", () => {
  it.each([
    [
      "Thanh",
      "Hello Register maestrofelipemagalhaes.com in Google's Search Index to be displayed in Google search results! Register maestrofelipemagalhaes.com here: addwebsite.pro",
    ],
    [
      "Eugenio",
      "Dear Sir/Madam Include maestrofelipemagalhaes.com in Google's Search Index and have it be displayed in web search results! Register maestrofelipemagalhaes.com now: searchregister.pro",
    ],
    [
      "Maurice",
      "Hi Add maestrofelipemagalhaes.com in Google's Search Index so it can be displayed in web search results! Add maestrofelipemagalhaes.com today: domainsubmit.site",
    ],
  ])("quarantines %s's lookalike-domain message", (_name, message) => {
    expect(
      verdict(
        "domains@search-maestrofelipemagalhaes.com",
        "Results for maestrofelipemagalhaes.com",
        message,
      ),
    ).toEqual({ spam: true, reason: "impersonated-domain" });
  });

  it("quarantines the SEO pitch sent from a real mailbox", () => {
    expect(
      verdict(
        "alex.roex@gmail.com",
        "Web, App & SEO Services for maestrofelipemagalhaes.com",
        "Hi maestrofelipemagalhaes.com, Do you have any plans to update, revamp, or improve your website soon?",
      ),
    ).toEqual({ spam: true, reason: "site-services-pitch" });
  });
});

describe("real messages stay in the inbox", () => {
  it.each([
    [
      "an invitation that mentions the site",
      "Convite para reger",
      "Olá! Vi o site maestrofelipemagalhaes.com e gostaria de convidar o maestro para reger nossa orquestra em março.",
    ],
    [
      "someone who found him on Google",
      "Masterclass",
      "Encontrei vocês pelo Google. O maestro dá aulas de regência?",
    ],
    [
      "a press request in English",
      "Interview request",
      "Hello, I write for a classical music magazine and would love to interview Felipe. I found your website through a festival programme.",
    ],
    [
      "a French message",
      "Concert à Lyon",
      "Bonjour, nous aimerions inviter le maestro à diriger un concert à Lyon. J'ai trouvé votre site par un collègue.",
    ],
  ])("keeps %s", (_label, subject, message) => {
    expect(verdict("organizadora@orquestra.org.br", subject, message)).toEqual({
      spam: false,
    });
  });

  it("does not treat the site's own domain as a lookalike", () => {
    expect(
      verdict(
        "contato@maestrofelipemagalhaes.com",
        "Teste",
        "Mensagem de teste.",
      ),
    ).toEqual({ spam: false });
  });

  it("still applies the pitch rule when the site URL is unknown", () => {
    expect(
      classifyContactMessage(
        {
          email: "x@gmail.com",
          subject: "Proposal",
          message: "We can improve your website SEO and rank higher.",
        },
        null,
      ),
    ).toEqual({ spam: true, reason: "site-services-pitch" });
  });
});
