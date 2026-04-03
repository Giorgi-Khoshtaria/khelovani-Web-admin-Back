import { APIRequestContext } from "@playwright/test";

export class MailTm {
  private static readonly API = "https://api.mail.tm";
  private static readonly PWD = "Qa!Passw0rd";

  /**
   * Create a new Mail.tm account with retries.
   */
  static async createAccount(
    request: APIRequestContext,
    retries = 5,
  ): Promise<{ address: string; token: string }> {
    for (let i = 0; i < retries; i++) {
      try {
        const dr = await request.get(`${this.API}/domains`);
        const data = await dr.json();
        const domain = data["hydra:member"]?.[0]?.domain;
        if (!domain) throw new Error("No domain");

        const login = `qa_${Math.random().toString(36).slice(2, 9)}`;
        const address = `${login}@${domain}`;

        const accRes = await request.post(`${this.API}/accounts`, {
          data: { address, password: this.PWD },
        });

        if (accRes.status() === 429) {
          await new Promise((r) => setTimeout(r, 3000 * (i + 1)));
          continue;
        }

        const tr = await request.post(`${this.API}/token`, {
          data: { address, password: this.PWD },
        });

        if (tr.status() === 429) {
          await new Promise((r) => setTimeout(r, 3000 * (i + 1)));
          continue;
        }

        const tdata = await tr.json();
        if (tdata.token) {
          return { address, token: tdata.token };
        }
      } catch (e) {
        if (i === retries - 1) break;
        await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
      }
    }

    // Fallback for random email generation if Mail.tm fails after retries
    return {
      address: `qa_${Date.now()}_${Math.floor(Math.random() * 9999)}@example.com`,
      token: "",
    };
  }

  /**
   * Poll for a verification email containing a certain subject.
   */
  static async waitForMail(
    request: APIRequestContext,
    token: string,
    subjectContains: string,
    timeoutMs = 60_000,
    pollMs = 5_000,
  ): Promise<string | null> {
    if (!token) return null;
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const r = await request.get(`${this.API}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await r.json();
      const msg = (data["hydra:member"] ?? []).find((m: any) =>
        m.subject?.includes(subjectContains),
      );
      if (msg) {
        const mr = await request.get(`${this.API}/messages/${msg.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const full = await mr.json();
        return full.text ?? full.html ?? "";
      }
      await new Promise((r) => setTimeout(r, pollMs));
    }
    return null;
  }
}
