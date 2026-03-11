import { Mail, MapPin, User } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";

const contactItems = [
  { label: "Owner", value: "Amulya M R" },
  { label: "Email", value: "amulyamr2008@gmail.com" },
  { label: "Address", value: "Bangalore, Karnataka" },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
      <p className="text-muted-foreground mb-10">
        Have questions? We would love to hear from you.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
            {submitted ? (
              <div
                className="text-center py-8"
                data-ocid="contact.success_state"
              >
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-7 h-7 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Message Sent!</h3>
                <p className="text-muted-foreground text-sm">
                  We will get back to you within 24 hours.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", message: "" });
                  }}
                  variant="outline"
                >
                  Send Another
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="text-sm font-medium mb-1 block"
                  >
                    Name
                  </label>
                  <input
                    id="contact-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    data-ocid="contact.name.input"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="text-sm font-medium mb-1 block"
                  >
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="your@email.com"
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    data-ocid="contact.email.input"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-message"
                    className="text-sm font-medium mb-1 block"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    rows={5}
                    placeholder="How can we help you?"
                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    data-ocid="contact.message.textarea"
                  />
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={!form.name || !form.email || !form.message}
                  data-ocid="contact.submit.button"
                >
                  Send Message
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {contactItems.map((c) => (
            <div
              key={c.label}
              className="flex items-start gap-4 bg-white border border-border rounded-xl p-5 shadow-sm"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                {c.label === "Email" ? (
                  <Mail className="w-5 h-5" />
                ) : c.label === "Owner" ? (
                  <User className="w-5 h-5" />
                ) : (
                  <MapPin className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{c.label}</p>
                <p className="text-sm text-muted-foreground">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
