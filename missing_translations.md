# Backend Controllers: Missing Translation Keys Recommendations

The following hardcoded messages were found in **Front-end / Shared Authenticated Controllers** that do not currently have an exact matching key inside the Database `alerts` namespace. 

You can add these keys to your Database using the Admin panel, or I can add them if you provide a bulk translation script layout setup respectfully.

---

### **1. `admin/auth/adminLogin.controller.ts`**

| Code Location | Hardcoded String (GE) | Recommended Key |
| :--- | :--- | :--- |
| Line 52 | `ადმინისტრატორის როლი არ არის აქტიური` | `alerts.admin_role_not_active` |
| Line 72 | `ადმინისტრატორი წარმატებით შევიდა სისტემაში` | `alerts.admin_login_success` |
| Line 126 | `ორგანიზაცია წარმატებით შევიდა სისტემაში` | `alerts.org_login_success` |

---

### **2. `partners/getPartner.controller.ts`**
*(If consumed by partners viewing their status)*

| Code Location | Hardcoded String (GE) | Recommended Key |
| :--- | :--- | :--- |
| Line 85 | `არასწორი სტატუსი` | `alerts.invalid_status` |
| Line 100 | `პარტნიორი უარყოფილია და წაიშალა ბაზიდან` | `alerts.partner_deleted_db` |
| Line 118 | `მეილის გაგზავნა ჩაიშალა, სტატუსი არ განახლებულა` | `alerts.mail_failed_status_unchanged` |
| Line 126 | `პარტნიორის სტატუსი განახლდა` | `alerts.partner_status_updated` |

---

### **Actionable Next Steps**
- Add the above translations into your Database `alerts` namespace trigger table.
- I will now update the Controllers that **DO have matching keys** (like `invalid_email_or_password`) to return the key string directly so the Front-end can translate it absolute securely!
