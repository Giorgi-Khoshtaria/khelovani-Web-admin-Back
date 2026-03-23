# 🌍 Comprehensive Translation Keys Checklist

> [!NOTE]
> This file contains **ALL** hardcoded Georgian strings extracted using pure JavaScript directory walker scans across all codebases folders.

## 📂 Backend

### 🏷️ Namespace: `controllers` 

| Suggested Key | Georgian Text (GE) | English Text (EN) | File | 
| :--- | :--- | :--- | :--- | 
| `adminlogin_controller_44` | .json({ message: 'ადმინისტრატორის როლი არ არის აქტიური' }); | | `controllers/admin/auth/adminLogin.controller.ts:44` |
| `adminlogin_controller_50` | res.status(422).json({ message: 'არასწორი მეილი ან პაროლი' }); | | `controllers/admin/auth/adminLogin.controller.ts:50` |
| `adminlogin_controller_64` | message: 'ადმინისტრატორი წარმატებით შევიდა სისტემაში', | | `controllers/admin/auth/adminLogin.controller.ts:64` |
| `adminlogin_controller_78` | res.status(422).json({ message: 'მომხმარებელი არ მოიძებნა' }); | | `controllers/admin/auth/adminLogin.controller.ts:78` |
| `adminlogin_controller_84` | res.status(403).json({ message: 'ორგანიზაცია არ არის აქტიური' }); | | `controllers/admin/auth/adminLogin.controller.ts:84` |
| `adminlogin_controller_92` | .json({ message: 'ორგანიზაცია ჯერ არ არის დადასტურებული' }); | | `controllers/admin/auth/adminLogin.controller.ts:92` |
| `adminlogin_controller_99` | res.status(422).json({ message: 'არასწორი მეილი ან პაროლი' }); | | `controllers/admin/auth/adminLogin.controller.ts:99` |
| `adminlogin_controller_115` | message: 'ორგანიზაცია წარმატებით შევიდა სისტემაში', | | `controllers/admin/auth/adminLogin.controller.ts:115` |
| `translation_controller_102` | errors: [{ field: 'ge', message: 'ერთი თარგმანი მაინც სავალდებულოა' }], | | `controllers/admin/translation/translation.controller.ts:102` |
| `getpartner_controller_18` | res.status(400).json({ message: 'არასწორი პარტნიორის ID' }); | | `controllers/partners/getPartner.controller.ts:18` |
| `getpartner_controller_25` | res.status(404).json({ message: 'პარტნიორი ვერ მოიძებნა' }); | | `controllers/partners/getPartner.controller.ts:25` |
| `getpartner_controller_73` | res.status(400).json({ message: 'არასწორი პარტნიორის ID' }); | | `controllers/partners/getPartner.controller.ts:73` |
| `getpartner_controller_80` | res.status(404).json({ message: 'პარტნიორი ვერ მოიძებნა' }); | | `controllers/partners/getPartner.controller.ts:80` |
| `getpartner_controller_85` | res.status(400).json({ message: 'არასწორი სტატუსი' }); | | `controllers/partners/getPartner.controller.ts:85` |
| `getpartner_controller_100` | .json({ message: 'პარტნიორი უარყოფილია და წაიშალა ბაზიდან' }); | | `controllers/partners/getPartner.controller.ts:100` |
| `getpartner_controller_116` | res.status(500).json({ message: 'მეილის გაგზავნა ჩაიშალა, სტატუსი არ განახლებულა' }); | | `controllers/partners/getPartner.controller.ts:116` |
| `getpartner_controller_124` | res.status(200).json({ message: 'პარტნიორის სტატუსი განახლდა' }); | | `controllers/partners/getPartner.controller.ts:124` |
| `partnerregistration_controller_38` | ? 'ამ ელ. ფოსტით ორგანიზაცია უკვე არსებობს' | | `controllers/partners/partnerRegistration.controller.ts:38` |
| `partnerregistration_controller_39` | : 'ამ საიდენტიფიკაციო კოდით ორგანიზაცია უკვე არსებობს', | | `controllers/partners/partnerRegistration.controller.ts:39` |
| `partnerregistration_controller_80` | res.status(201).json({ message: 'პარტნიორი წარმატებით დარეგისტრირდა' }); | | `controllers/partners/partnerRegistration.controller.ts:80` |
| `forgot_password_controller_35` | 'თუ ეს ელ-ფოსტა რეგისტრირებულია, პაროლის აღდგენის ლინკი გაიგზავნება', | | `controllers/user/forgot-password.controller.ts:35` |
| `forgot_password_controller_44` | 'თუ ეს ელ-ფოსტა რეგისტრირებულია, პაროლის აღდგენის ლინკი გაიგზავნება', | | `controllers/user/forgot-password.controller.ts:44` |
| `forgot_password_controller_61` | res.status(422).json({ message: 'ტოკენი სავალდებულოა' }); | | `controllers/user/forgot-password.controller.ts:61` |
| `forgot_password_controller_77` | res.status(400).json({ message: 'ტოკენი არასწორია ან ვადა გასულია' }); | | `controllers/user/forgot-password.controller.ts:77` |
| `forgot_password_controller_83` | res.status(404).json({ message: 'მომხმარებელი არ მოიძებნა' }); | | `controllers/user/forgot-password.controller.ts:83` |
| `forgot_password_controller_90` | res.status(200).json({ message: 'პაროლი წარმატებით შეიცვალა' }); | | `controllers/user/forgot-password.controller.ts:90` |
| `login_controller_25` | res.status(422).json({ message: 'მომხმარებელი არ მოიძებნა' }); | | `controllers/user/login.controller.ts:25` |
| `login_controller_31` | message: 'გთხოვთ ჯერ დაადასტუროთ ელ-ფოსტა', | | `controllers/user/login.controller.ts:31` |
| `login_controller_39` | res.status(422).json({ message: 'არასწორი მეილი ან პაროლი' }); | | `controllers/user/login.controller.ts:39` |
| `login_controller_53` | message: 'მომხმარებელი წარმატებით შევიდა სისტემაში', | | `controllers/user/login.controller.ts:53` |
| `registration_controller_44` | message: 'ვერიფიკაციის ლინკი ხელახლა გაიგზავნა თქვენს ელ-ფოსტაზე', | | `controllers/user/registration.controller.ts:44` |
| `registration_controller_49` | message: 'ამ ელ. ფოსტით მომხმარებელი უკვე არსებობს', | | `controllers/user/registration.controller.ts:49` |
| `registration_controller_61` | message: 'ამ პირადი ნომრით მომხმარებელი უკვე არსებობს', | | `controllers/user/registration.controller.ts:61` |
| `registration_controller_98` | 'მომხმარებელი წარმატებით დარეგისტრირდა! გთხოვთ შეამოწმოთ ელ-ფოსტა დასადასტურებლად', | | `controllers/user/registration.controller.ts:98` |
| `verifyemail_controller_17` | res.status(400).json({ message: 'ტოკენი არ მოიძებნა' }); | | `controllers/verification/verifyEmail.controller.ts:17` |
| `verifyemail_controller_25` | res.status(404).json({ message: 'მომხმარებელი ვერ მოიძებნა' }); | | `controllers/verification/verifyEmail.controller.ts:25` |
| `verifyemail_controller_45` | 'ვერიფიკაციის ლინკის ვადა გასულია. გთხოვთ ხელახლა დარეგისტრირდეთ.', | | `controllers/verification/verifyEmail.controller.ts:45` |
| `verifyemail_controller_53` | message: 'ლინკი არასწორია ან დაზიანებულია.', | | `controllers/verification/verifyEmail.controller.ts:53` |
| `verifyemail_controller_60` | message: 'სერვერის შეცდომა. სცადეთ მოგვიანებით.', | | `controllers/verification/verifyEmail.controller.ts:60` |

### 🏷️ Namespace: `middleware` 

| Suggested Key | Georgian Text (GE) | English Text (EN) | File | 
| :--- | :--- | :--- | :--- | 
| `authenticate_26` | res.status(401).json({ message: 'ავტორიზაცია საჭიროა' }); | | `middleware/auth/authenticate.ts:26` |
| `authenticate_35` | res.status(401).json({ message: 'არასწორი ან ვადაგასული ტოკენი' }); | | `middleware/auth/authenticate.ts:35` |
| `requirepanel_6` | res.status(401).json({ message: 'ავტორიზაცია საჭიროა' }); | | `middleware/role/requirePanel.ts:6` |
| `requirepanel_11` | res.status(403).json({ message: 'ამ პანელზე წვდომა არ გაქვთ' }); | | `middleware/role/requirePanel.ts:11` |
| `requirepermission_6` | res.status(401).json({ message: 'ავტორიზაცია საჭიროა' }); | | `middleware/role/requirePermission.ts:6` |
| `requirepermission_16` | res.status(403).json({ message: 'წვდომა აკრძალულია' }); | | `middleware/role/requirePermission.ts:16` |

### 🏷️ Namespace: `utils` 

| Suggested Key | Georgian Text (GE) | English Text (EN) | File | 
| :--- | :--- | :--- | :--- | 
| `sendnotificationemail_15` | title: 'რეგისტრაცია წარმატებით დასრულდა', | | `utils/email/sendNotificationEmail.ts:15` |
| `sendnotificationemail_16` | greeting: `გამარჯობა ${recipientName},`, | | `utils/email/sendNotificationEmail.ts:16` |
| `sendnotificationemail_18` | 'თქვენი ორგანიზაცია წარმატებით დარეგისტრირდა. სისტემაში შესასვლელად გამოიყენეთ ქვემოთ მოცემული პაროლი:', | | `utils/email/sendNotificationEmail.ts:18` |
| `sendnotificationemail_20` | footerText: 'გთხოვთ, შეცვალოთ პაროლი სისტემაში შესვლის შემდეგ.', | | `utils/email/sendNotificationEmail.ts:20` |
| `sendnotificationemail_24` | title: 'შეტყობინება', | | `utils/email/sendNotificationEmail.ts:24` |
| `sendnotificationemail_25` | message: 'თქვენ გაქვთ ახალი შეტყობინება', | | `utils/email/sendNotificationEmail.ts:25` |
| `sendpartneremail_10` | 'თქვენი პაროლი პარტნიორის სისტემისთვის', | | `utils/email/sendPartnerEmail.ts:10` |
| `senduseremails_10` | const subject = 'მომხმარებლის რეგისტრაციისთვის ელ-ფოსტის დადასტურება'; | | `utils/email/sendUserEmails.ts:10` |
| `senduseremails_13` | 'მადლობა რეგისტრაციისთვის! გთხოვთ დაადასტუროთ თქვენი ელ-ფოსტის მისამართი ქვემოთ მოცემულ ღილაკზე დაჭერით.'; | | `utils/email/sendUserEmails.ts:13` |
| `senduseremails_23` | const subject = 'მომხმარებლის დავიწყებული პაროლის აღდგენა'; | | `utils/email/sendUserEmails.ts:23` |
| `sendverificationemail_10` | btnText: 'დაადასტურე ელ-ფოსტა', | | `utils/email/sendVerificationEmail.ts:10` |
| `sendverificationemail_12` | 'მადლობა რეგისტრაციისთვის! გთხოვთ დაადასტუროთ თქვენი ელ-ფოსტის მისამართი ქვემოთ მოცემულ ღილაკზე დაჭერით.', | | `utils/email/sendVerificationEmail.ts:12` |
| `sendverificationemail_16` | btnText: 'აღადგინე პაროლი', | | `utils/email/sendVerificationEmail.ts:16` |
| `sendverificationemail_18` | 'პაროლი დაგავიწყდა შეცვალე შენი პაროლი ქვემოთ მოცემულ ღილაკზე დაჭერით.', | | `utils/email/sendVerificationEmail.ts:18` |
| `verifyemailhtml_10` | ელ-ფოსტის დადასტურება | | `utils/email/templates/verifyEmailHTML.ts:10` |
| `verifyemailhtml_22` | ელ-ფოსტის დადასტურება | | `utils/email/templates/verifyEmailHTML.ts:22` |
| `verifyemailhtml_28` | გამარჯობა, | | `utils/email/templates/verifyEmailHTML.ts:28` |
| `verifyemailhtml_48` | თუ ღილაკი არ მუშაობს, დააკოპირე ეს ლინკი ბრაუზერში: | | `utils/email/templates/verifyEmailHTML.ts:48` |
| `verifyemailhtml_60` | ლინკი მოქმედებს 24 საათი. | | `utils/email/templates/verifyEmailHTML.ts:60` |
| `verifyemailhtml_61` | თუ თქვენ არ მოგითხოვიათ რეგისტრაცია, უგულებელყავით ეს წერილი. | | `utils/email/templates/verifyEmailHTML.ts:61` |
| `seedtranslation_21` | translations: { ge: 'შენახვა', en: 'Save' }, | | `utils/seeds/seedTranslation.ts:21` |
| `seedtranslation_26` | translations: { ge: 'გაუქმება', en: 'Cancel' }, | | `utils/seeds/seedTranslation.ts:26` |
| `seedtranslation_31` | translations: { ge: 'წარმატებით შეინახა', en: 'Successfully saved' }, | | `utils/seeds/seedTranslation.ts:31` |
| `seedtranslation_36` | translations: { ge: 'მთავარი', en: 'Home' }, | | `utils/seeds/seedTranslation.ts:36` |
| `usertypes_26` | export type BtnText = 'დაადასტურე ელ-ფოსტა' \| 'აღადგინე პაროლი'; | | `utils/types/userTypes.ts:26` |

### 🏷️ Namespace: `validations` 

| Suggested Key | Georgian Text (GE) | English Text (EN) | File | 
| :--- | :--- | :--- | :--- | 
| `orgvalidation_25` | message: 'კომპანიის სახელი (ლათინურად) სავალდებულოა', | | `validations/forms/orgValidation.ts:25` |
| `orgvalidation_30` | message: 'კომპანიის სახელი უნდა შეიცავდეს მხოლოდ ლათინურ სიმბოლოებს', | | `validations/forms/orgValidation.ts:30` |
| `orgvalidation_38` | message: 'საიდენტიფიკაციო კოდი სავალდებულოა', | | `validations/forms/orgValidation.ts:38` |
| `orgvalidation_43` | message: 'საიდენტიფიკაციო კოდი უნდა შეიცავდეს ზუსტად 9 ციფრს', | | `validations/forms/orgValidation.ts:43` |
| `orgvalidation_51` | message: 'საკონტაქტო პირის სახელი სავალდებულოა', | | `validations/forms/orgValidation.ts:51` |
| `orgvalidation_56` | message: 'საკონტაქტო პირის სახელი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს', | | `validations/forms/orgValidation.ts:56` |
| `orgvalidation_74` | errors.push({ field: 'address', message: 'მისამართი სავალდებულოა' }); | | `validations/forms/orgValidation.ts:74` |
| `orgvalidation_78` | message: 'მისამართი უნდა შეიცავდეს მინიმუმ 5 სიმბოლოს', | | `validations/forms/orgValidation.ts:78` |
| `orgvalidation_86` | message: 'აღწერა არ უნდა აღემატებოდეს 500 სიმბოლოს', | | `validations/forms/orgValidation.ts:86` |
| `partnervalidation_20` | message: 'კომპანიის ქართული სახელი სავალდებულოა', | | `validations/forms/partnerValidation.ts:20` |
| `partnervalidation_27` | message: 'კომპანიის ინგლისური სახელი სავალდებულოა', | | `validations/forms/partnerValidation.ts:27` |
| `partnervalidation_34` | message: 'საიდენტიფიკაციო კოდი სავალდებულოა', | | `validations/forms/partnerValidation.ts:34` |
| `partnervalidation_39` | message: 'საიდენტიფიკაციო კოდი უნდა შეიცავდეს 9 ციფრს', | | `validations/forms/partnerValidation.ts:39` |
| `partnervalidation_46` | message: 'საკონტაქტო პირი სავალდებულოა', | | `validations/forms/partnerValidation.ts:46` |
| `partnervalidation_60` | errors.push({ field: 'address', message: 'მისამართი სავალდებულოა' }); | | `validations/forms/partnerValidation.ts:60` |
| `partnervalidation_61` | } else if (!/^[ა-ჰ0-9\s.,/\\\-()]+$/.test(data.address.trim())) { | | `validations/forms/partnerValidation.ts:61` |
| `partnervalidation_64` | message: 'მისამართი უნდა იყოს ქართულად', | | `validations/forms/partnerValidation.ts:64` |
| `partnervalidation_71` | message: 'მისამართი (ინგლისურად) სავალდებულოა', | | `validations/forms/partnerValidation.ts:71` |
| `partnervalidation_76` | message: 'მისამართი (ინგლისურად) უნდა იყოს ინგლისურად', | | `validations/forms/partnerValidation.ts:76` |
| `partnervalidation_83` | message: 'წესებზე და პირობებზე დათანხმება აუცილებელია', | | `validations/forms/partnerValidation.ts:83` |
| `registervalidation_20` | errors.push({ field: 'idNumber', message: 'პირადი ნომერი სავალდებულოა' }); | | `validations/forms/registerValidation.ts:20` |
| `registervalidation_24` | message: 'პირადი ნომერი უნდა შეიცავდეს ზუსტად 11 ციფრს', | | `validations/forms/registerValidation.ts:24` |
| `registervalidation_39` | message: 'დაბადების თარიღი სავალდებულოა', | | `validations/forms/registerValidation.ts:39` |
| `registervalidation_46` | message: 'დაბადების თარიღი არასწორი ფორმატისაა', | | `validations/forms/registerValidation.ts:46` |
| `registervalidation_57` | message: 'მომხმარებელი უნდა იყოს მინიმუმ 16 წლის', | | `validations/forms/registerValidation.ts:57` |
| `registervalidation_62` | message: 'გთხოვთ, შეიყვანოთ სწორი დაბადების თარიღი', | | `validations/forms/registerValidation.ts:62` |
| `registervalidation_73` | errors.push({ field: 'address', message: 'მისამართი სავალდებულოა' }); | | `validations/forms/registerValidation.ts:73` |
| `registervalidation_77` | message: 'მისამართი უნდა შეიცავდეს მინიმუმ 5 სიმბოლოს', | | `validations/forms/registerValidation.ts:77` |
| `registervalidation_82` | message: 'მისამართი არ უნდა აღემატებოდეს 200 სიმბოლოს', | | `validations/forms/registerValidation.ts:82` |
| `translationvalidation_10` | errors.push({ field: 'namespace', message: 'ნეიმსპეისი სავალდებულოა' }); | | `validations/forms/translationValidation.ts:10` |
| `translationvalidation_14` | errors.push({ field: 'key', message: 'გასაღები სავალდებულოა' }); | | `validations/forms/translationValidation.ts:14` |
| `translationvalidation_18` | errors.push({ field: 'ge', message: 'ქართული თარგმანი სავალდებულოა' }); | | `validations/forms/translationValidation.ts:18` |
| `translationvalidation_19` | errors.push({ field: 'en', message: 'ინგლისური თარგმანი სავალდებულოა' }); | | `validations/forms/translationValidation.ts:19` |
| `translationvalidation_23` | errors.push({ field: 'en', message: 'ინგლისური თარგმანი სავალდებულოა' }); | | `validations/forms/translationValidation.ts:23` |
| `city_validation_11` | if (!city \|\| city.trim() === '') return 'ქალაქი სავალდებულოა'; | | `validations/shared/city.validation.ts:11` |
| `city_validation_13` | return `ქალაქი უნდა იყოს: ${VALID_CITIES.join(', ')}`; | | `validations/shared/city.validation.ts:13` |
| `email_validation_2` | if (!email \|\| email.trim() === '') return 'ელ. ფოსტა სავალდებულოა'; | | `validations/shared/email.validation.ts:2` |
| `email_validation_4` | return 'ელ. ფოსტის ფორმატი არასწორია'; | | `validations/shared/email.validation.ts:4` |
| `name_validation_5` | return 'სახელი (ქართულად) უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს'; | | `validations/shared/name.validation.ts:5` |
| `name_validation_7` | return 'სახელი (ქართულად) უნდა შეიცავდეს მხოლოდ ქართულ ასოებს'; | | `validations/shared/name.validation.ts:7` |
| `name_validation_13` | if (!name \|\| name.trim() === '') return 'სახელი (ინგლისურად) სავალდებულოა'; | | `validations/shared/name.validation.ts:13` |
| `name_validation_15` | return 'სახელი (ინგლისურად) უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს'; | | `validations/shared/name.validation.ts:15` |
| `name_validation_17` | return 'სახელი (ინგლისურად) უნდა შეიცავდეს მხოლოდ ლათინურ ასოებს'; | | `validations/shared/name.validation.ts:17` |
| `password_validation_5` | errors.push('პაროლი სავალდებულოა'); | | `validations/shared/password.validation.ts:5` |
| `password_validation_10` | errors.push('პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს'); | | `validations/shared/password.validation.ts:10` |
| `password_validation_12` | errors.push('პაროლი არ უნდა აღემატებოდეს 64 სიმბოლოს'); | | `validations/shared/password.validation.ts:12` |
| `password_validation_14` | errors.push('პაროლი უნდა შეიცავდეს მინიმუმ ერთ დიდ ასოს (A-Z)'); | | `validations/shared/password.validation.ts:14` |
| `password_validation_16` | errors.push('პაროლი უნდა შეიცავდეს მინიმუმ ერთ პატარა ასოს (a-z)'); | | `validations/shared/password.validation.ts:16` |
| `password_validation_18` | errors.push('პაროლი უნდა შეიცავდეს მინიმუმ ერთ ციფრს (0-9)'); | | `validations/shared/password.validation.ts:18` |
| `password_validation_21` | 'პაროლი უნდა შეიცავდეს მინიმუმ ერთ სპეციალურ სიმბოლოს (!@#$%...)', | | `validations/shared/password.validation.ts:21` |
| `phone_validation_2` | if (!phone \|\| phone.trim() === '') return 'ტელეფონის ნომერი სავალდებულოა'; | | `validations/shared/phone.validation.ts:2` |
| `phone_validation_4` | return 'ტელეფონის ნომერი უნდა იყოს ფორმატში: 5XX XXX XXX'; | | `validations/shared/phone.validation.ts:4` |

## 📂 AdminFront

### 🏷️ Namespace: `components` 

| Suggested Key | Georgian Text (GE) | English Text (EN) | File | 
| :--- | :--- | :--- | :--- | 
| `header_16` | ადმინ პანელი | | `components/header/Header.tsx:16` |
| `header_19` | გასვლა | | `components/header/Header.tsx:19` |
| `partnercard_27` | ? 'მოლოდინი' | | `components/partners/PartnerCard/PartnerCard.tsx:27` |
| `partnercard_29` | ? 'დადასტურებული' | | `components/partners/PartnerCard/PartnerCard.tsx:29` |
| `partnercard_30` | : 'უარყოფილი'} | | `components/partners/PartnerCard/PartnerCard.tsx:30` |
| `partnercard_36` | საიდენტიფიკაციო კოდი:{' '} | | `components/partners/PartnerCard/PartnerCard.tsx:36` |
| `partnercard_41` | Ელ-ფოსტა: {partner.email} | | `components/partners/PartnerCard/PartnerCard.tsx:41` |
| `partnercard_48` | დეტალურად | | `components/partners/PartnerCard/PartnerCard.tsx:48` |
| `partnercard_55` | უარყოფა | | `components/partners/PartnerCard/PartnerCard.tsx:55` |
| `sidemanu_9` | { path: '/', label: 'მენიუ' }, | | `components/sideManu/SideManu.tsx:9` |
| `sidemanu_10` | { path: '/partners', label: 'პარტნიორების სია' }, | | `components/sideManu/SideManu.tsx:10` |
| `sidemanu_11` | { path: '/translations', label: 'თარგმანები' }, | | `components/sideManu/SideManu.tsx:11` |
| `namespacesidebar_16` | კატეგორიები | | `components/translation/NamespaceSidebar.tsx:16` |
| `translationform_37` | ახალი თარგმანის დამატება | | `components/translation/TranslationForm.tsx:37` |
| `translationform_39` | ნეიმსპეისი (Namespace): | | `components/translation/TranslationForm.tsx:39` |
| `translationform_52` | გასაღები (Key): | | `components/translation/TranslationForm.tsx:52` |
| `translationform_55` | placeholder='მაგ: save_button' | | `components/translation/TranslationForm.tsx:55` |
| `translationform_62` | ქართული (GE): | | `components/translation/TranslationForm.tsx:62` |
| `translationform_65` | placeholder='შენახვა' | | `components/translation/TranslationForm.tsx:65` |
| `translationform_72` | ინგლისური (EN): | | `components/translation/TranslationForm.tsx:72` |
| `translationform_82` | დამატება | | `components/translation/TranslationForm.tsx:82` |
| `translationitem_58` | შენახვა | | `components/translation/TranslationItem.tsx:58` |
| `translationitem_61` | გაუქმება | | `components/translation/TranslationItem.tsx:61` |
| `translationitem_67` | რედაქტირება | | `components/translation/TranslationItem.tsx:67` |
| `translationitem_70` | წაშლა | | `components/translation/TranslationItem.tsx:70` |
| `translationlist_38` | გასაღები (Key) | | `components/translation/TranslationList.tsx:38` |
| `translationlist_39` | ქართული (GE) | | `components/translation/TranslationList.tsx:39` |
| `translationlist_40` | ინგლისური (EN) | | `components/translation/TranslationList.tsx:40` |
| `translationlist_41` | მოქმედება | | `components/translation/TranslationList.tsx:41` |

### 🏷️ Namespace: `hooks` 

| Suggested Key | Georgian Text (GE) | English Text (EN) | File | 
| :--- | :--- | :--- | :--- | 
| `useaddtranslationform_47` | onError(getErrorMessage(err, 'დამატება ვერ მოხერხდა')); | | `hooks/useAddTranslationForm.ts:47` |
| `useedittranslationform_34` | onError(getErrorMessage(err, 'განახლება ვერ მოხერხდა')); | | `hooks/useEditTranslationForm.ts:34` |
| `usetranslation_64` | setToastError('Excel ფაილი ცარიელია ან არასწორი ფორმატია'); | | `hooks/useTranslation.ts:64` |
| `usetranslation_71` | setToastError(getErrorMessage(err, 'იმპორტის დროს დაფიქსირდა შეცდომა')); | | `hooks/useTranslation.ts:71` |
| `usetranslation_76` | if (!window.confirm('ნამდვილად გსურთ ამ თარგმანის წაშლა?')) return; | | `hooks/useTranslation.ts:76` |
| `usetranslation_81` | setToastError(getErrorMessage(err, 'წაშლა ვერ მოხერხდა')); | | `hooks/useTranslation.ts:81` |
| `usetranslationdata_40` | setError(getErrorMessage(err, 'მონაცემების ჩატვირთვა ვერ მოხერხდა')); | | `hooks/useTranslationData.ts:40` |

### 🏷️ Namespace: `lib` 

| Suggested Key | Georgian Text (GE) | English Text (EN) | File | 
| :--- | :--- | :--- | :--- | 
| `cityoptions_2` | { value: 'tbilisi', label: 'თბილისი' }, | | `lib/ui/CityOptions.ts:2` |
| `cityoptions_3` | { value: 'batumi', label: 'ბათუმი' }, | | `lib/ui/CityOptions.ts:3` |
| `cityoptions_4` | { value: 'kutaisi', label: 'ქუთაისი' }, | | `lib/ui/CityOptions.ts:4` |
| `cityoptions_5` | { value: 'rustavi', label: 'რუსთავი' }, | | `lib/ui/CityOptions.ts:5` |
| `cityoptions_6` | { value: 'gori', label: 'გორი' }, | | `lib/ui/CityOptions.ts:6` |
| `cityoptions_7` | { value: 'zugdidi', label: 'ზუგდიდი' }, | | `lib/ui/CityOptions.ts:7` |
| `passwordinput_43` | aria-label='პაროლის ჩვენება' | | `lib/ui/PasswordInput.tsx:43` |
| `termscheckbox_25` | ვეთანხმები მომსახურების პირობებს და{' '} | | `lib/ui/TermsCheckbox.tsx:25` |
| `termscheckbox_26` | კონფიდენციალურობის პოლიტიკას | | `lib/ui/TermsCheckbox.tsx:26` |

### 🏷️ Namespace: `pages` 

| Suggested Key | Georgian Text (GE) | English Text (EN) | File | 
| :--- | :--- | :--- | :--- | 
| `translationpage_14` | თარგმანების მართვა | | `pages/Translation/TranslationPage.tsx:14` |
| `translationpage_17` | Excel იმპორტი | | `pages/Translation/TranslationPage.tsx:17` |
| `translationpage_29` | {addForm.isAddMode ? 'გაუქმება' : 'ახალი გასაღები'} | | `pages/Translation/TranslationPage.tsx:29` |
| `translationpage_49` | placeholder='ძებნა გასაღებით...' | | `pages/Translation/TranslationPage.tsx:49` |
| `translationpage_56` | იტვირთება... | | `pages/Translation/TranslationPage.tsx:56` |
| `translationpage_60` | თარგმანები ვერ მოიძებნა | | `pages/Translation/TranslationPage.tsx:60` |
| `loginpage_64` | toast.success('წარმატებით შეხვედით ადმინ პანელში!'); | | `pages/login/loginPage.tsx:64` |
| `loginpage_79` | toast.error('შესვლის დროს დაფიქსირდა შეცდომა'); | | `pages/login/loginPage.tsx:79` |
| `loginpage_82` | toast.error('შესვლის დროს დაფიქსირდა შეცდომა'); | | `pages/login/loginPage.tsx:82` |
| `loginpage_96` | ადმინ პანელი | | `pages/login/loginPage.tsx:96` |
| `loginpage_106` | label='ელ-ფოსტა' | | `pages/login/loginPage.tsx:106` |
| `loginpage_117` | label='პაროლი' | | `pages/login/loginPage.tsx:117` |
| `loginpage_121` | placeholder='შეიყვანე პაროლი' | | `pages/login/loginPage.tsx:121` |
| `loginpage_130` | {isLoading ? 'მიმდინარეობს...' : 'შესვლა'} | | `pages/login/loginPage.tsx:130` |
| `menu_9` | მთავარი გვერდი | | `pages/menu/Menu.tsx:9` |
| `partnerdetailedpage_28` | setError('ავტორიზაცია ვერ მოხერხდა (პარტნიორის ID არ მოიძებნა)'); | | `pages/partnerDetailed/PartnerDetailedPage.tsx:28` |
| `partnerdetailedpage_40` | err.response?.data?.message \|\| 'ინფორმაციის ჩატვირთვა ვერ მოხერხდა', | | `pages/partnerDetailed/PartnerDetailedPage.tsx:40` |
| `partnerdetailedpage_43` | setError('მოხდა გაუთვალისწინებელი შეცდომა'); | | `pages/partnerDetailed/PartnerDetailedPage.tsx:43` |
| `partnerdetailedpage_64` | alert(err.response?.data?.message \|\| 'სტატუსის განახლება ვერ მოხერხდა'); | | `pages/partnerDetailed/PartnerDetailedPage.tsx:64` |
| `partnerdetailedpage_66` | alert('მოხდა გაუთვალისწინებელი შეცდომა'); | | `pages/partnerDetailed/PartnerDetailedPage.tsx:66` |
| `partnerdetailedpage_73` | if (loading) return იტვირთება...; | | `pages/partnerDetailed/PartnerDetailedPage.tsx:73` |
| `partnerdetailedpage_75` | if (!partner) return პარტნიორი ვერ მოიძებნა; | | `pages/partnerDetailed/PartnerDetailedPage.tsx:75` |
| `partnerdetailedpage_82` | ← უკან | | `pages/partnerDetailed/PartnerDetailedPage.tsx:82` |
| `partnerdetailedpage_92` | {updating ? 'მუშავდება...' : 'უარყოფა'} | | `pages/partnerDetailed/PartnerDetailedPage.tsx:92` |
| `partnerdetailedpage_97` | ? 'მოლოდინი' | | `pages/partnerDetailed/PartnerDetailedPage.tsx:97` |
| `partnerdetailedpage_99` | ? 'დადასტურებული' | | `pages/partnerDetailed/PartnerDetailedPage.tsx:99` |
| `partnerdetailedpage_100` | : 'უარყოფილი'} | | `pages/partnerDetailed/PartnerDetailedPage.tsx:100` |
| `partnerdetailedpage_107` | პარტნიორის მართვა | | `pages/partnerDetailed/PartnerDetailedPage.tsx:107` |
| `partnerdetailedpage_114` | {updating ? 'მუშავდება...' : 'დადასტურება'} | | `pages/partnerDetailed/PartnerDetailedPage.tsx:114` |
| `partnerdetailedpage_121` | {updating ? 'მუშავდება...' : 'უარყოფა'} | | `pages/partnerDetailed/PartnerDetailedPage.tsx:121` |
| `partnerdetailedpage_139` | ზოგადი ინფორმაცია | | `pages/partnerDetailed/PartnerDetailedPage.tsx:139` |
| `partnerdetailedpage_142` | label='საიდენტიფიკაციო კოდი' | | `pages/partnerDetailed/PartnerDetailedPage.tsx:142` |
| `partnerdetailedpage_149` | label='საკონტაქტო პირი' | | `pages/partnerDetailed/PartnerDetailedPage.tsx:149` |
| `partnerdetailedpage_156` | label='ქალაქი' | | `pages/partnerDetailed/PartnerDetailedPage.tsx:156` |
| `partnerdetailedpage_163` | label='მისამართი' | | `pages/partnerDetailed/PartnerDetailedPage.tsx:163` |
| `partnerdetailedpage_170` | label='მისამართი (ინგლისურად)' | | `pages/partnerDetailed/PartnerDetailedPage.tsx:170` |
| `partnerdetailedpage_178` | საკონტაქტო ინფორმაცია | | `pages/partnerDetailed/PartnerDetailedPage.tsx:178` |
| `partnerdetailedpage_181` | label='ტელეფონი' | | `pages/partnerDetailed/PartnerDetailedPage.tsx:181` |
| `partnerdetailedpage_188` | label='ელ. ფოსტა' | | `pages/partnerDetailed/PartnerDetailedPage.tsx:188` |
| `partnerdetailedpage_198` | აღწერა | | `pages/partnerDetailed/PartnerDetailedPage.tsx:198` |
| `partnerdetailedpage_201` | label='აღწერა' | | `pages/partnerDetailed/PartnerDetailedPage.tsx:201` |
| `partnerlisting_36` | 'პარტნიორების ჩატვირთვა ვერ მოხერხდა', | | `pages/partnerListings/PartnerListing.tsx:36` |
| `partnerlisting_39` | setError('მოხდა გაუთვალისწინებელი შეცდომა'); | | `pages/partnerListings/PartnerListing.tsx:39` |
| `partnerlisting_54` | პარტნიორების სია | | `pages/partnerListings/PartnerListing.tsx:54` |
| `partnerlisting_60` | ყველა | | `pages/partnerListings/PartnerListing.tsx:60` |
| `partnerlisting_66` | მოლოდინი | | `pages/partnerListings/PartnerListing.tsx:66` |
| `partnerlisting_72` | დადასტურებული | | `pages/partnerListings/PartnerListing.tsx:72` |
| `partnerlisting_78` | უარყოფილი | | `pages/partnerListings/PartnerListing.tsx:78` |
| `partnerlisting_86` | placeholder='ძებნა კომპანიის სახელით...' | | `pages/partnerListings/PartnerListing.tsx:86` |
| `partnerlisting_93` | იტვირთება მონაცემები... | | `pages/partnerListings/PartnerListing.tsx:93` |
| `partnerlisting_97` | განყოფილება ცარიელია | | `pages/partnerListings/PartnerListing.tsx:97` |

### 🏷️ Namespace: `utils` 

| Suggested Key | Georgian Text (GE) | English Text (EN) | File | 
| :--- | :--- | :--- | :--- | 
| `handleapierror_7` | return 'მოხდა გაუთვალისწინებელი შეცდომა'; | | `utils/handleApiError.ts:7` |

### 🏷️ Namespace: `validations` 

| Suggested Key | Georgian Text (GE) | English Text (EN) | File | 
| :--- | :--- | :--- | :--- | 
| `email_validation_2` | if (!email \|\| email.trim() === '') return 'ელ-ფოსტა აუცილებელია'; | | `validations/shared/email.validation.ts:2` |
| `email_validation_4` | return 'არასწორი ელ-ფოსტის ფორმატი'; | | `validations/shared/email.validation.ts:4` |
| `password_validation_2` | if (!password \|\| password.trim() === '') return 'პაროლი აუცილებელია'; | | `validations/shared/password.validation.ts:2` |
| `translationvalidations_10` | errors.namespace = 'ნეიმსპეისი სავალდებულოა'; | | `validations/translationValidations.ts:10` |
| `translationvalidations_14` | errors.key = 'გასაღები სავალდებულოა'; | | `validations/translationValidations.ts:14` |
| `translationvalidations_18` | errors.ge = 'ქართული თარგმანი სავალდებულოა'; | | `validations/translationValidations.ts:18` |
| `translationvalidations_22` | errors.en = 'ინგლისური თარგმანი სავალდებულოა'; | | `validations/translationValidations.ts:22` |

## 📂 WebFront

### 🏷️ Namespace: `app` 

| Suggested Key | Georgian Text (GE) | English Text (EN) | File | 
| :--- | :--- | :--- | :--- | 
| `page_57` | toast.success('განაცხადი წარმატებით გაიგზავნა!'); | | `app/(main)/become-partner/page.tsx:57` |
| `page_71` | toast.error('რეგისტრაციის დროს დაფიქსირდა შეცდომა'); | | `app/(main)/become-partner/page.tsx:71` |
| `page_74` | toast.error('რეგისტრაციის დროს დაფიქსირდა შეცდომა'); | | `app/(main)/become-partner/page.tsx:74` |
| `page_85` | პარტნიორის რეგისტრაცია | | `app/(main)/become-partner/page.tsx:85` |
| `page_86` | შეავსე ფორმა და გახდი ჩვენი პლატფორმის პარტნიორი | | `app/(main)/become-partner/page.tsx:86` |
| `page_96` | label='კომპანიის სახელი (ქართულად)' | | `app/(main)/become-partner/page.tsx:96` |
| `page_100` | placeholder='კომპანიის სახელი' | | `app/(main)/become-partner/page.tsx:100` |
| `page_105` | label='კომპანიის სახელი (ლათინურად)' | | `app/(main)/become-partner/page.tsx:105` |
| `page_114` | label='საიდენტიფიკაციო კოდი' | | `app/(main)/become-partner/page.tsx:114` |
| `page_118` | placeholder='9-ნიშნა საიდენტიფიკაციო კოდი' | | `app/(main)/become-partner/page.tsx:118` |
| `page_125` | label='საკონტაქტო პირის სახელი' | | `app/(main)/become-partner/page.tsx:125` |
| `page_129` | placeholder='სახელი გვარი' | | `app/(main)/become-partner/page.tsx:129` |
| `page_134` | label='ტელეფონის ნომერი' | | `app/(main)/become-partner/page.tsx:134` |
| `page_142` | label='ქალაქი' | | `app/(main)/become-partner/page.tsx:142` |
| `page_146` | placeholder='აირჩიე ქალაქი' | | `app/(main)/become-partner/page.tsx:146` |
| `page_152` | label='ელ. ფოსტა' | | `app/(main)/become-partner/page.tsx:152` |
| `page_162` | label='მისამართი' | | `app/(main)/become-partner/page.tsx:162` |
| `page_166` | placeholder='ქუჩა, შენობა, ოფისი' | | `app/(main)/become-partner/page.tsx:166` |
| `page_171` | label='მისამართი (ინგლისურად)' | | `app/(main)/become-partner/page.tsx:171` |
| `page_180` | label='კომპანიის მოკლე აღწერა' | | `app/(main)/become-partner/page.tsx:180` |
| `page_181` | hint='რამდენიმე წინადადებით აღწერე შენი კომპანია' | | `app/(main)/become-partner/page.tsx:181` |
| `page_185` | placeholder='მაგ: ჩვენ ვართ ქართული ხელნაკეთი სამკაულების მწარმოებელი კომპანია, დაარსებული 2010 წელს...' | | `app/(main)/become-partner/page.tsx:185` |
| `page_203` | {isLoading ? 'მიმდინარეობს...' : 'რეგისტრაცია'} | | `app/(main)/become-partner/page.tsx:203` |
| `page_215` | alt='უკან' | | `app/(main)/become-partner/page.tsx:215` |
| `page_217` | მთავარ გვერდზე დაბრუნება | | `app/(main)/become-partner/page.tsx:217` |
| `page_59` | error?.response?.data?.message ?? 'მოთხოვნის გაგზავნა ვერ მოხერხდა'; | | `app/(main)/forgot-password/page.tsx:59` |
| `page_66` | toast.error('სერვერთან დაკავშირება ვერ მოხერხდა'); | | `app/(main)/forgot-password/page.tsx:66` |
| `page_88` | შეამოწმე ელ. ფოსტა | | `app/(main)/forgot-password/page.tsx:88` |
| `page_90` | პაროლის აღდგენის ბმული გაგზავნილია {email}-ზე. | | `app/(main)/forgot-password/page.tsx:90` |
| `page_91` | შეამოწმე შენი შემოსული ფოსტა. | | `app/(main)/forgot-password/page.tsx:91` |
| `page_98` | შესვლის გვერდზე დაბრუნება | | `app/(main)/forgot-password/page.tsx:98` |
| `page_104` | დაგავიწყდა პაროლი? | | `app/(main)/forgot-password/page.tsx:104` |
| `page_106` | შეიყვანე შენი მეილი და ჩვენ გამოგიგზავნით  პაროლის აღდგენის | | `app/(main)/forgot-password/page.tsx:106` |
| `page_107` | ბმულს | | `app/(main)/forgot-password/page.tsx:107` |
| `page_112` | label='ელ. ფოსტა' | | `app/(main)/forgot-password/page.tsx:112` |
| `page_128` | ? 'იგზავნება...' | | `app/(main)/forgot-password/page.tsx:128` |
| `page_129` | : 'გაგზავნა'} | | `app/(main)/forgot-password/page.tsx:129` |
| `page_133` | შესვლის გვერდზე დაბრუნება | | `app/(main)/forgot-password/page.tsx:133` |
| `page_63` | toast.success('წარმატებით შეხვედით სისტემაში'); | | `app/(main)/login/page.tsx:63` |
| `page_68` | error?.response?.data?.message ?? 'შეცდომა შევიდა სისტემაში'; | | `app/(main)/login/page.tsx:68` |
| `page_77` | toast.error('სერვერთან დაკავშირება ვერ მოხერხდა'); | | `app/(main)/login/page.tsx:77` |
| `page_79` | toast.error('შეცდომა შევიდა სისტემაში'); | | `app/(main)/login/page.tsx:79` |
| `page_90` | კეთილი იყოს თქვენი მობრძანება | | `app/(main)/login/page.tsx:90` |
| `page_91` | შედი შენს ანგარიშზე გასაგრძელებლად | | `app/(main)/login/page.tsx:91` |
| `page_97` | label='ელ. ფოსტა' | | `app/(main)/login/page.tsx:97` |
| `page_102` | placeholder='მაგ: example@gmail.com' | | `app/(main)/login/page.tsx:102` |
| `page_107` | label='პაროლი' | | `app/(main)/login/page.tsx:107` |
| `page_111` | placeholder='შეიყვანე პაროლი' | | `app/(main)/login/page.tsx:111` |
| `page_115` | პაროლი დაგავიწყდა? | | `app/(main)/login/page.tsx:115` |
| `page_123` | ? 'მიმდინარეობს...' | | `app/(main)/login/page.tsx:123` |
| `page_124` | : 'შესვლა'} | | `app/(main)/login/page.tsx:124` |
| `page_130` | არ გაქვს ანგარიში? | | `app/(main)/login/page.tsx:130` |
| `page_131` | რეგისტრაცია | | `app/(main)/login/page.tsx:131` |
| `page_141` | alt='უკან' | | `app/(main)/login/page.tsx:141` |
| `page_143` | მთავარ გვერდზე დაბრუნება | | `app/(main)/login/page.tsx:143` |
| `page_79` | 'ანგარიში წარმატებით შეიქმნა! გთხოვთ დაადასტუროთ თქვენი მეილი', | | `app/(main)/register/page.tsx:79` |
| `page_99` | toast.error('რეგისტრაციის დროს დაფიქსირდა შეცდომა'); | | `app/(main)/register/page.tsx:99` |
| `page_102` | toast.error('სერვერთან დაკავშირება ვერ მოხერხდა. სცადეთ მოგვიანებით'); | | `app/(main)/register/page.tsx:102` |
| `page_104` | toast.error('რეგისტრაციის დროს დაფიქსირდა შეცდომა'); | | `app/(main)/register/page.tsx:104` |
| `page_115` | ანგარიშის შექმნა | | `app/(main)/register/page.tsx:115` |
| `page_116` | შემოგვიერთდი და აღმოაჩინე ქართული ხელოსნური ნივთები | | `app/(main)/register/page.tsx:116` |
| `page_126` | label='პირადი ნომერი *' | | `app/(main)/register/page.tsx:126` |
| `page_130` | placeholder='11-ნიშნა პირადი ნომერი' | | `app/(main)/register/page.tsx:130` |
| `page_137` | label='სახელი და გვარი (ქართულად)' | | `app/(main)/register/page.tsx:137` |
| `page_141` | placeholder='სახელი გვარი' | | `app/(main)/register/page.tsx:141` |
| `page_146` | label='სახელი და გვარი (ლათინურად) *' | | `app/(main)/register/page.tsx:146` |
| `page_155` | label='ელ-ფოსტა *' | | `app/(main)/register/page.tsx:155` |
| `page_165` | label='ტელეფონის ნომერი *' | | `app/(main)/register/page.tsx:165` |
| `page_173` | label='დაბადების თარიღი *' | | `app/(main)/register/page.tsx:173` |
| `page_182` | label='ქალაქი *' | | `app/(main)/register/page.tsx:182` |
| `page_186` | placeholder='აირჩიე ქალაქი' | | `app/(main)/register/page.tsx:186` |
| `page_192` | label='მისამართი *' | | `app/(main)/register/page.tsx:192` |
| `page_196` | placeholder='ქუჩა, შენობა, ბინა' | | `app/(main)/register/page.tsx:196` |
| `page_202` | label='პაროლი *' | | `app/(main)/register/page.tsx:202` |
| `page_206` | placeholder='შექმენი ძლიერი პაროლი' | | `app/(main)/register/page.tsx:206` |
| `page_211` | label='გაიმეორე პაროლი *' | | `app/(main)/register/page.tsx:211` |
| `page_215` | placeholder='ხელახლა შეიყვანე პაროლი' | | `app/(main)/register/page.tsx:215` |
| `page_234` | ? 'მიმდინარეობს...' | | `app/(main)/register/page.tsx:234` |
| `page_235` | : 'ანგარიშის შექმნა'} | | `app/(main)/register/page.tsx:235` |
| `page_242` | უკვე გაქვს ანგარიში? შესვლა | | `app/(main)/register/page.tsx:242` |
| `page_253` | alt='უკან' | | `app/(main)/register/page.tsx:253` |
| `page_255` | მთავარ გვერდზე დაბრუნება | | `app/(main)/register/page.tsx:255` |
| `layout_7` | title: 'ხელოვანი — ქართული ხელნაკეთი ნივთები', | | `app/layout.tsx:7` |
| `layout_9` | 'აღმოაჩინეთ ნამდვილი ქართული ხელოვნება და ხელნაკეთი ნივთები, შექმნილი ოსტატი ხელოსნების მიერ.', | | `app/layout.tsx:9` |
| `page_54` | ბმული არასწორია | | `app/reset-password/page.tsx:54` |
| `page_55` | პაროლის აღდგენის ბმული არასწორია ან ვადა გასულია. | | `app/reset-password/page.tsx:55` |
| `page_56` | ახლიდან სცადე | | `app/reset-password/page.tsx:56` |
| `page_89` | toast.success('პაროლი წარმატებით შეიცვალა'); | | `app/reset-password/page.tsx:89` |
| `page_94` | error?.response?.data?.message ?? 'პაროლის შეცვლა ვერ მოხერხდა'; | | `app/reset-password/page.tsx:94` |
| `page_97` | toast.error('სერვერთან დაკავშირება ვერ მოხერხდა'); | | `app/reset-password/page.tsx:97` |
| `page_127` | პაროლი შეიცვალა! | | `app/reset-password/page.tsx:127` |
| `page_128` | შეგიძლია ახლა შეხვიდე სისტემაში ახალი პაროლით. | | `app/reset-password/page.tsx:128` |
| `page_129` | შესვლა | | `app/reset-password/page.tsx:129` |
| `page_155` | ახალი პაროლი | | `app/reset-password/page.tsx:155` |
| `page_156` | შეიყვანე ახალი პაროლი შენი ანგარიშისთვის | | `app/reset-password/page.tsx:156` |
| `page_161` | label='ახალი პაროლი' | | `app/reset-password/page.tsx:161` |
| `page_165` | placeholder='მინ. 8 სიმბოლო' | | `app/reset-password/page.tsx:165` |
| `page_170` | label='გაიმეორე პაროლი' | | `app/reset-password/page.tsx:170` |
| `page_174` | placeholder='გაიმეორე ახალი პაროლი' | | `app/reset-password/page.tsx:174` |
| `page_182` | {isLoading ? 'მიმდინარეობს...' : 'პაროლის შეცვლა'} | | `app/reset-password/page.tsx:182` |
| `page_197` | იტვირთება... | | `app/reset-password/page.tsx:197` |
| `page_17` | token ? '' : 'ტოკენი არ მოიძებნა. ლინკი არასწორია.', | | `app/verify/page.tsx:17` |
| `page_38` | err.response?.data?.message ?? 'დადასტურება ვერ მოხერხდა', | | `app/verify/page.tsx:38` |
| `page_41` | setErrorMessage('სერვერთან დაკავშირება ვერ მოხერხდა'); | | `app/verify/page.tsx:41` |
| `page_60` | მიმდინარეობს დადასტურება... | | `app/verify/page.tsx:60` |
| `page_83` | {stage === 'already' ? 'უკვე დადასტურებულია' : 'დადასტურებულია!'} | | `app/verify/page.tsx:83` |
| `page_87` | ? 'შენი ელ-ფოსტა უკვე დადასტურებულია. შეგიძლია შეხვიდე სისტემაში.' | | `app/verify/page.tsx:87` |
| `page_88` | : 'შენი ელ-ფოსტა წარმატებით დადასტურდა. ახლა შეგიძლია შეხვიდე სისტემაში.'} | | `app/verify/page.tsx:88` |
| `page_91` | შესვლა | | `app/verify/page.tsx:91` |
| `page_126` | დადასტურება ვერ მოხერხდა | | `app/verify/page.tsx:126` |
| `page_129` | ხელახლა რეგისტრაცია | | `app/verify/page.tsx:129` |
| `page_159` | იტვირთება... | | `app/verify/page.tsx:159` |

### 🏷️ Namespace: `components` 

| Suggested Key | Georgian Text (GE) | English Text (EN) | File | 
| :--- | :--- | :--- | :--- | 
| `header_32` | { title: 'მთავარი', titleEn: 'Home', path: '/' }, | | `components/header/Header.tsx:32` |
| `header_33` | { title: 'ჩვენ შესახებ', titleEn: 'About', path: '/about' }, | | `components/header/Header.tsx:33` |
| `header_34` | { title: 'პროდუქტები', titleEn: 'Products', path: '/products' }, | | `components/header/Header.tsx:34` |
| `header_35` | { title: 'პარტნიორები', titleEn: 'Partners', path: '/partners' }, | | `components/header/Header.tsx:35` |
| `header_36` | { title: 'კონტაქტი', titleEn: 'Contact', path: '/contact' }, | | `components/header/Header.tsx:36` |
| `authactions_13` | {lang === 'GE' ? 'შესვლა' : 'Login'} | | `components/header/auth-component/AuthActions.tsx:13` |
| `authactions_16` | {lang === 'GE' ? 'რეგისტრაცია' : 'Register'} | | `components/header/auth-component/AuthActions.tsx:16` |
| `mainpagehero_7` | 'აღმოაჩინეთ ნამდვილი ქართული ხელოვნება და ხელნაკეთი ნივთები, რომლებიც შექმნილია ოსტატი ხელოსნების მიერ. თითოეული ნამუშევარი მოგვითხრობს ტრადიციის, უნარებისა და კულტურული მემკვიდრეობის ისტორიას, რომელიც თაობიდან თაობას გადაეცემა.'; | | `components/mainPageHero/MainPageHero.tsx:7` |
| `mainpagehero_33` | აღმოაჩინე კოლექცია | | `components/mainPageHero/MainPageHero.tsx:33` |
| `mainpagehero_36` | აღმოაჩინე პარტნიორები | | `components/mainPageHero/MainPageHero.tsx:36` |
| `mainpagehero_39` | გახდი პარტნიორი | | `components/mainPageHero/MainPageHero.tsx:39` |
| `cityoptions_2` | { value: 'tbilisi', label: 'თბილისი' }, | | `components/ui/CityOptions.ts:2` |
| `cityoptions_3` | { value: 'batumi', label: 'ბათუმი' }, | | `components/ui/CityOptions.ts:3` |
| `cityoptions_4` | { value: 'kutaisi', label: 'ქუთაისი' }, | | `components/ui/CityOptions.ts:4` |
| `cityoptions_5` | { value: 'rustavi', label: 'რუსთავი' }, | | `components/ui/CityOptions.ts:5` |
| `cityoptions_6` | { value: 'gori', label: 'გორი' }, | | `components/ui/CityOptions.ts:6` |
| `cityoptions_7` | { value: 'zugdidi', label: 'ზუგდიდი' }, | | `components/ui/CityOptions.ts:7` |
| `passwordinput_42` | aria-label='პაროლის ჩვენება' | | `components/ui/PasswordInput.tsx:42` |
| `termscheckbox_25` | ვეთანხმები მომსახურების პირობებს და{' '} | | `components/ui/TermsCheckbox.tsx:25` |
| `termscheckbox_26` | კონფიდენციალურობის პოლიტიკას | | `components/ui/TermsCheckbox.tsx:26` |

### 🏷️ Namespace: `lib` 

| Suggested Key | Georgian Text (GE) | English Text (EN) | File | 
| :--- | :--- | :--- | :--- | 
| `usecheckifuserislogin_15` | toast.error('თქვენ უკვე შესული ხართ სისტემაში'); | | `lib/hooks/useCheckIfUserIsLogin.ts:15` |
| `useratelimitcooldown_26` | cooldownText: cooldown > 0 ? `${cooldown} წამში სცადე თავიდან...` : '', | | `lib/hooks/useRateLimitCooldown.ts:26` |
| `registrationvalidations_46` | errors.idNumber = 'პირადი ნომერი აუცილებელია'; | | `lib/validations/RegistrationValidations.ts:46` |
| `registrationvalidations_48` | errors.idNumber = 'პირადი ნომერი უნდა შეიცავდეს მხოლოდ ციფრებს'; | | `lib/validations/RegistrationValidations.ts:48` |
| `registrationvalidations_50` | errors.idNumber = 'პირადი ნომერი უნდა შედგებოდეს ზუსტად 11 ციფრისგან'; | | `lib/validations/RegistrationValidations.ts:50` |
| `registrationvalidations_63` | errors.dateOfBirth = 'აირჩიეთ დაბადების თარიღი'; | | `lib/validations/RegistrationValidations.ts:63` |
| `registrationvalidations_75` | errors.dateOfBirth = 'რეგისტრაციისთვის საჭიროა მინიმუმ 18 წელი'; | | `lib/validations/RegistrationValidations.ts:75` |
| `registrationvalidations_77` | errors.dateOfBirth = 'გთხოვთ შეიყვანოთ სწორი დაბადების თარიღი'; | | `lib/validations/RegistrationValidations.ts:77` |
| `registrationvalidations_83` | errors.city = 'აირჩიეთ ქალაქი'; | | `lib/validations/RegistrationValidations.ts:83` |
| `registrationvalidations_88` | errors.address = 'მისამართი აუცილებელია'; | | `lib/validations/RegistrationValidations.ts:88` |
| `registrationvalidations_91` | 'მისამართი უნდა შეიცავდეს მხოლოდ ქართულ ან ლათინურ სიმბოლოებს'; | | `lib/validations/RegistrationValidations.ts:91` |
| `registrationvalidations_93` | errors.address = 'მისამართი უნდა შეიცავდეს მინიმუმ 5 სიმბოლოს'; | | `lib/validations/RegistrationValidations.ts:93` |
| `registrationvalidations_95` | errors.address = 'მისამართი არ უნდა აღემატებოდეს 200 სიმბოლოს'; | | `lib/validations/RegistrationValidations.ts:95` |
| `registrationvalidations_116` | errors.terms = 'თქვენ უნდა დაეთანხმოთ წესებს და პირობებს'; | | `lib/validations/RegistrationValidations.ts:116` |
| `becomepartnervalidations_51` | errors.identificationCode = 'საიდენტიფიკაციო კოდი აუცილებელია'; | | `lib/validations/becomePartnerValidations.ts:51` |
| `becomepartnervalidations_54` | 'საიდენტიფიკაციო კოდი უნდა შეიცავდეს მხოლოდ ციფრებს'; | | `lib/validations/becomePartnerValidations.ts:54` |
| `becomepartnervalidations_57` | 'საიდენტიფიკაციო კოდი უნდა შედგებოდეს ზუსტად 9 ციფრისგან'; | | `lib/validations/becomePartnerValidations.ts:57` |
| `becomepartnervalidations_62` | errors.contactPerson = 'საკონტაქტო პირის სახელი აუცილებელია'; | | `lib/validations/becomePartnerValidations.ts:62` |
| `becomepartnervalidations_64` | errors.contactPerson = 'სახელი უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს'; | | `lib/validations/becomePartnerValidations.ts:64` |
| `becomepartnervalidations_66` | errors.contactPerson = 'სახელი არ უნდა აღემატებოდეს 200 სიმბოლოს'; | | `lib/validations/becomePartnerValidations.ts:66` |
| `becomepartnervalidations_91` | errors.description = 'კომპანიის აღწერა აუცილებელია'; | | `lib/validations/becomePartnerValidations.ts:91` |
| `becomepartnervalidations_93` | errors.description = 'აღწერა უნდა შეიცავდეს მინიმუმ 10 სიმბოლოს'; | | `lib/validations/becomePartnerValidations.ts:93` |
| `becomepartnervalidations_95` | errors.description = 'აღწერა არ უნდა აღემატებოდეს 1000 სიმბოლოს'; | | `lib/validations/becomePartnerValidations.ts:95` |
| `becomepartnervalidations_100` | errors.terms = 'თქვენ უნდა დაეთანხმოთ წესებს და პირობებს'; | | `lib/validations/becomePartnerValidations.ts:100` |
| `fieldvalidators_14` | return required ? 'სახელი (ქართულად) აუცილებელია' : null; | | `lib/validations/shared/fieldValidators.ts:14` |
| `fieldvalidators_17` | return 'სახელი (ქართულად) უნდა შეიცავდეს მხოლოდ ქართულ ასოებს'; | | `lib/validations/shared/fieldValidators.ts:17` |
| `fieldvalidators_19` | return 'სახელი (ქართულად) უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს'; | | `lib/validations/shared/fieldValidators.ts:19` |
| `fieldvalidators_21` | return 'სახელი (ქართულად) არ უნდა აღემატებოდეს 200 სიმბოლოს'; | | `lib/validations/shared/fieldValidators.ts:21` |
| `fieldvalidators_30` | return required ? 'სახელი (ლათინურად) აუცილებელია' : null; | | `lib/validations/shared/fieldValidators.ts:30` |
| `fieldvalidators_33` | return 'სახელი (ლათინურად) უნდა შეიცავდეს მხოლოდ ლათინურ ასოებს'; | | `lib/validations/shared/fieldValidators.ts:33` |
| `fieldvalidators_35` | return 'სახელი (ლათინურად) უნდა შეიცავდეს მინიმუმ 2 სიმბოლოს'; | | `lib/validations/shared/fieldValidators.ts:35` |
| `fieldvalidators_37` | return 'სახელი (ლათინურად) არ უნდა აღემატებოდეს 200 სიმბოლოს'; | | `lib/validations/shared/fieldValidators.ts:37` |
| `fieldvalidators_45` | if (!email) return 'ელ. ფოსტა სავალდებულოა'; | | `lib/validations/shared/fieldValidators.ts:45` |
| `fieldvalidators_46` | if (!EMAIL_REGEX.test(email)) return 'შეიყვანეთ სწორი ელ. ფოსტის მისამართი'; | | `lib/validations/shared/fieldValidators.ts:46` |
| `fieldvalidators_56` | if (!password) return 'პაროლი სავალდებულოა'; | | `lib/validations/shared/fieldValidators.ts:56` |
| `fieldvalidators_58` | return `პაროლი უნდა შეიცავდეს მინიმუმ ${PASSWORD_MIN_LENGTH} სიმბოლოს`; | | `lib/validations/shared/fieldValidators.ts:58` |
| `fieldvalidators_60` | return 'პაროლი უნდა შეიცავდეს მინიმუმ ერთ ასოს'; | | `lib/validations/shared/fieldValidators.ts:60` |
| `fieldvalidators_61` | if (!/[0-9]/.test(password)) return 'პაროლი უნდა შეიცავდეს მინიმუმ ერთ ციფრს'; | | `lib/validations/shared/fieldValidators.ts:61` |
| `fieldvalidators_71` | if (!password) return 'პაროლი აუცილებელია'; | | `lib/validations/shared/fieldValidators.ts:71` |
| `fieldvalidators_73` | return 'პაროლი უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს'; | | `lib/validations/shared/fieldValidators.ts:73` |
| `fieldvalidators_74` | if (password.length > 30) return 'პაროლი არ უნდა აღემატებოდეს 30 სიმბოლოს'; | | `lib/validations/shared/fieldValidators.ts:74` |
| `fieldvalidators_76` | return 'პაროლი უნდა შეიცავდეს მინიმუმ 1 დიდ ასოს'; | | `lib/validations/shared/fieldValidators.ts:76` |
| `fieldvalidators_78` | return 'პაროლი უნდა შეიცავდეს მინიმუმ 1 სპეციალურ სიმბოლოს (!@#$%...)'; | | `lib/validations/shared/fieldValidators.ts:78` |
| `fieldvalidators_90` | if (!confirmPassword) return 'გაიმეორეთ პაროლი'; | | `lib/validations/shared/fieldValidators.ts:90` |
| `fieldvalidators_91` | if (confirmPassword !== password) return 'პაროლები არ ემთხვევა'; | | `lib/validations/shared/fieldValidators.ts:91` |
| `fieldvalidators_96` | if (!city) return 'აირჩიეთ ქალაქი'; | | `lib/validations/shared/fieldValidators.ts:96` |
| `fieldvalidators_100` | if (!phone \|\| phone.trim() === '') return 'ტელეფონის ნომერი სავალდებულოა'; | | `lib/validations/shared/fieldValidators.ts:100` |
| `fieldvalidators_102` | return 'ტელეფონის ნომერი უნდა იყოს ფორმატში: 5XX XXX XXX'; | | `lib/validations/shared/fieldValidators.ts:102` |
| `fieldvalidators_107` | if (!address) return 'მისამართი აუცილებელია'; | | `lib/validations/shared/fieldValidators.ts:107` |
| `fieldvalidators_109` | return 'მისამართი უნდა შეიცავდეს მხოლოდ ქართულ სიმბოლოებს'; | | `lib/validations/shared/fieldValidators.ts:109` |
| `fieldvalidators_111` | return 'მისამართი უნდა შეიცავდეს მინიმუმ 5 სიმბოლოს'; | | `lib/validations/shared/fieldValidators.ts:111` |
| `fieldvalidators_113` | return 'მისამართი არ უნდა აღემატებოდეს 200 სიმბოლოს'; | | `lib/validations/shared/fieldValidators.ts:113` |
| `fieldvalidators_118` | if (!addressEn) return 'მისამართი (ინგლისურად) აუცილებელია'; | | `lib/validations/shared/fieldValidators.ts:118` |
| `fieldvalidators_120` | return 'მისამართი (ინგლისურად) უნდა შეიცავდეს მხოლოდ ლათინურ სიმბოლოებს'; | | `lib/validations/shared/fieldValidators.ts:120` |
| `fieldvalidators_122` | return 'მისამართი (ინგლისურად) უნდა შეიცავდეს მინიმუმ 5 სიმბოლოს'; | | `lib/validations/shared/fieldValidators.ts:122` |
| `fieldvalidators_124` | return 'მისამართი (ინგლისურად) არ უნდა აღემატებოდეს 200 სიმბოლოს'; | | `lib/validations/shared/fieldValidators.ts:124` |

