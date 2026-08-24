#!/usr/bin/env python3
"""
Dopamine Streetwear - Servidor Fullstack Multi-Dispositivo
Soporte nativo sin dependencias externas (Python 3 Standard Library).
Permite acceso desde Localhost, Red Wi-Fi / LAN y cualquier computadora o móvil.
"""

import http.server
import socketserver
import json
import os
import sys
import socket
import hashlib
import time
from datetime import datetime
from urllib.parse import urlparse, parse_qs

# Force UTF-8 on Windows stdout if possible
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

PORT = int(os.environ.get("PORT", 3000))
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_FILE = os.path.join(os.path.dirname(__file__), "users_db.json")

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def hash_password(password):
    if not password:
        return ""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def get_users():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_users(users):
    try:
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(users, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"[ERROR] Guardando base de datos: {e}")

# Asegurar que el archivo de base de datos exista
if not os.path.exists(DATA_FILE):
    save_users([])

class DopamineRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def _set_cors_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept")
        self.send_header("Content-Type", content_type)
        self.end_headers()

    def send_error(self, code, message=None, explain=None):
        if code == 404:
            page_404 = os.path.join(BASE_DIR, "404.html")
            if os.path.exists(page_404):
                try:
                    with open(page_404, "rb") as f:
                        content = f.read()
                    self.send_response(404)
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                    self.send_header("Content-Length", str(len(content)))
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(content)
                    return
                except Exception:
                    pass
        super().send_error(code, message, explain)

    def do_OPTIONS(self):
        self._set_cors_headers(200)

    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        # 1. API: Server Info
        if path == "/api/server-info":
            local_ip = get_local_ip()
            self._set_cors_headers(200)
            res = {
                "success": True,
                "status": "online",
                "localIp": local_ip,
                "port": PORT,
                "urls": {
                    "localhost": f"http://localhost:{PORT}",
                    "network": f"http://{local_ip}:{PORT}",
                    "login": f"http://{local_ip}:{PORT}/login.html",
                    "admin": f"http://{local_ip}:{PORT}/admin-clientes.html"
                }
            }
            self.wfile.write(json.dumps(res).encode("utf-8"))
            return

        # 2. API: Get all users for Admin
        if path == "/api/users/admin":
            users = get_users()
            self._set_cors_headers(200)
            res = {"success": True, "source": "python_json", "users": users}
            self.wfile.write(json.dumps(res).encode("utf-8"))
            return

        # Serve static files
        return super().do_GET()

    def do_POST(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        content_length = int(self.headers.get("Content-Length", 0))
        body_bytes = self.rfile.read(content_length)
        body = {}
        if body_bytes:
            try:
                body = json.loads(body_bytes.decode("utf-8"))
            except Exception:
                body = {}

        # 1. Register / Upsert User
        if path == "/api/users/register":
            email = (body.get("email") or "").strip().lower()
            if not email:
                self._set_cors_headers(400)
                self.wfile.write(json.dumps({"success": False, "error": "Email requerido"}).encode("utf-8"))
                return

            raw_pass = body.get("password") or ""
            name = body.get("name") or email.split("@")[0]
            birthdate = body.get("birthdate") or "No especificada"
            email_verified = body.get("emailVerified", True)
            pass_hash = hash_password(raw_pass)
            pass_masked = (raw_pass[:2] + "••••" + raw_pass[-2:]) if len(raw_pass) > 3 else ("••••••••" if raw_pass else "Google OAuth")
            now_iso = datetime.now().isoformat()
            user_id = "usr_" + hex(int(time.time() * 1000))[2:]

            users = get_users()
            idx = next((i for i, u in enumerate(users) if u.get("email", "").lower() == email), -1)

            user_obj = {
                "id": users[idx]["id"] if idx != -1 else user_id,
                "name": name,
                "email": email,
                "passwordHash": pass_hash,
                "rawPassword": raw_pass,
                "passwordMasked": pass_masked,
                "birthdate": birthdate,
                "provider": "email",
                "emailVerified": bool(email_verified),
                "createdAt": users[idx].get("createdAt", now_iso) if idx != -1 else now_iso,
                "lastLogin": now_iso
            }

            if idx != -1:
                users[idx] = user_obj
            else:
                users.insert(0, user_obj)
            save_users(users)

            print(f"[REGISTRO] {email} ({name}) guardado en la base de datos.")
            self._set_cors_headers(200)
            self.wfile.write(json.dumps({"success": True, "user": user_obj}).encode("utf-8"))
            return

        # 2. Login User
        if path == "/api/users/login":
            email = (body.get("email") or "").strip().lower()
            password = (body.get("password") or "").strip()

            if not email or not password:
                self._set_cors_headers(400)
                self.wfile.write(json.dumps({"success": False, "error": "Email y contraseña requeridos"}).encode("utf-8"))
                return

            users = get_users()
            user = next((u for u in users if u.get("email", "").lower() == email), None)

            if not user:
                self._set_cors_headers(401)
                self.wfile.write(json.dumps({"success": False, "error": "No existe una cuenta con este correo"}).encode("utf-8"))
                return

            input_hash = hash_password(password)
            match_hash = user.get("passwordHash") and user.get("passwordHash") == input_hash
            match_raw = user.get("rawPassword") and user.get("rawPassword") == password

            if not match_hash and not match_raw:
                self._set_cors_headers(401)
                self.wfile.write(json.dumps({"success": False, "error": "Contraseña incorrecta"}).encode("utf-8"))
                return

            user["lastLogin"] = datetime.now().isoformat()
            save_users(users)

            print(f"[LOGIN] {email} inicio sesion correctamente.")
            self._set_cors_headers(200)
            self.wfile.write(json.dumps({"success": True, "user": user}).encode("utf-8"))
            return

        # 3. Social / Google User
        if path == "/api/users/social":
            email = (body.get("email") or "").strip().lower()
            name = body.get("name") or email.split("@")[0]
            picture = body.get("picture") or ""
            provider = body.get("provider") or "google"
            now_iso = datetime.now().isoformat()
            user_id = "usr_" + hex(int(time.time() * 1000))[2:]

            users = get_users()
            idx = next((i for i, u in enumerate(users) if u.get("email", "").lower() == email), -1)

            user_obj = {
                "id": users[idx]["id"] if idx != -1 else user_id,
                "name": name,
                "email": email,
                "picture": picture,
                "rawPassword": "Ingresó con Google",
                "passwordMasked": "Google OAuth",
                "birthdate": "Google Account",
                "provider": provider,
                "emailVerified": True,
                "createdAt": users[idx].get("createdAt", now_iso) if idx != -1 else now_iso,
                "lastLogin": now_iso
            }

            if idx != -1:
                users[idx] = user_obj
            else:
                users.insert(0, user_obj)
            save_users(users)

            self._set_cors_headers(200)
            self.wfile.write(json.dumps({"success": True, "user": user_obj}).encode("utf-8"))
            return

        # 4. Clear All
        if path == "/api/users/clear-all":
            save_users([])
            print("[ADMIN] Base de datos vaciada.")
            self._set_cors_headers(200)
            self.wfile.write(json.dumps({"success": True, "message": "Base de datos vaciada."}).encode("utf-8"))
            return

        # 5. Send Verification Email
        if path == "/api/send-verification-email":
            to_email = (body.get("to") or "").strip().lower()
            code = (body.get("code") or "").strip()

            if not to_email or not code:
                self._set_cors_headers(400)
                self.wfile.write(json.dumps({"error": "Faltan to o code"}).encode("utf-8"))
                return

            print("\n" + "=" * 58)
            print("[CODIGO DE VERIFICACION GENERADO]")
            print(f"   Destinatario: {to_email}")
            print(f"   Codigo 6 digitos: >>> {code} <<<")
            print(f"   Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            print("=" * 58 + "\n")

            self._set_cors_headers(200)
            res = {
                "success": True,
                "message": "Codigo generado y registrado con exito.",
                "recipient": to_email,
                "code": code
            }
            self.wfile.write(json.dumps(res).encode("utf-8"))
            return

        self._set_cors_headers(404)
        self.wfile.write(json.dumps({"error": "Ruta no encontrada"}).encode("utf-8"))

    def do_DELETE(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        if path.startswith("/api/users/"):
            user_id = path.replace("/api/users/", "").strip()
            users = get_users()
            new_users = [u for u in users if u.get("id") != user_id]
            save_users(new_users)
            print(f"[ADMIN] Usuario eliminado ID: {user_id}")
            self._set_cors_headers(200)
            self.wfile.write(json.dumps({"success": True, "message": "Usuario eliminado"}).encode("utf-8"))
            return

        self._set_cors_headers(404)
        self.wfile.write(json.dumps({"error": "Ruta no encontrada"}).encode("utf-8"))

class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

def main():
    local_ip = get_local_ip()
    print("\n" + "=" * 68)
    print("SERVIDOR DOPAMINE STREETWEAR INICIADO CORRECTAMENTE")
    print("=" * 68)
    print(f" [LOCAL]       http://localhost:{PORT}")
    print(f" [RED LOCAL]   http://{local_ip}:{PORT}")
    print(f" [LOGIN]       http://{local_ip}:{PORT}/login.html")
    print(f" [ADMIN]       http://{local_ip}:{PORT}/admin-clientes.html")
    print("=" * 68)
    print("Cualquier persona en tu misma red Wi-Fi puede abrir la URL 'RED LOCAL'")
    print("y verificar su cuenta de forma 100% real.")
    print("=" * 68 + "\n")

    server_address = ("0.0.0.0", PORT)
    httpd = ThreadingHTTPServer(server_address, DopamineRequestHandler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nDeteniendo servidor...")
        httpd.server_close()

if __name__ == "__main__":
    main()
