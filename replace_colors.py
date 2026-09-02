import re

file_path = r'c:\cakecampus-build\src\components\screens\AdminScreen.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = [
    (r'bg-white text-rose-600 shadow-xs', r'bg-[#FFF8EE] text-[#D4A017] shadow-xs'),
    (r'text-zinc-600 hover:text-zinc-900', r'text-[#7C5542] hover:text-[#1A0A04]'),
    (r'text-zinc-600 hover:text-rose-600', r'text-[#7C5542] hover:text-[#D4A017]'),
    (r'border-2 border-rose-300', r'border-2 border-[#D4A017]/30'),
    
    (r'hover:bg-rose-600', r'hover:bg-[#D4A017]'),
    (r'hover:bg-rose-700', r'hover:bg-[#C8860A]'),
    (r'hover:bg-rose-100', r'hover:bg-[#D4A017]/15'),
    (r'disabled:bg-rose-400', r'disabled:bg-[#D4A017]/60'),
    (r'disabled:bg-rose-300', r'disabled:bg-[#D4A017]/50'),
    (r'focus:border-rose-500', r'focus:border-[#D4A017]'),
    (r'shadow-rose-600/20', r'shadow-[#D4A017]/20'),
    (r'shadow-rose-600/30', r'shadow-[#D4A017]/30'),
    
    (r'text-rose-600', r'text-[#D4A017]'),
    (r'text-rose-700', r'text-[#C8860A]'),
    (r'text-rose-800', r'text-[#7C5542]'),
    (r'text-rose-900', r'text-[#1A0A04]'),
    
    (r'bg-rose-600', r'bg-[#D4A017]'),
    (r'bg-rose-50', r'bg-[#D4A017]/10'),
    (r'bg-rose-100', r'bg-[#D4A017]/15'),
    
    (r'border-rose-200', r'border-[#D4A017]/25'),
    (r'border-rose-300', r'border-[#D4A017]/30'),
    
    (r'bg-white', r'bg-[#FFF8EE]'),
    
    (r'text-zinc-500', r'text-[#7C5542]'),
    (r'text-zinc-600', r'text-[#7C5542]'),
    (r'text-zinc-700', r'text-[#7C5542]'),
    (r'text-zinc-400', r'text-[#7C5542]/70'),
    (r'text-zinc-800', r'text-[#1A0A04]'),
    (r'text-zinc-900', r'text-[#1A0A04]'),
    
    (r'text-\[\#2A050F\]', r'text-[#1A0A04]'),
    (r'bg-\[\#FAF7F5\]', r'bg-[#F5EDE4]'),
    (r'border-\[\#E8DED6\]', r'border-[#D4A017]/20'),
    
    (r'border-zinc-200', r'border-[#D4A017]/20'),
    (r'border-zinc-100', r'border-[#D4A017]/15'),
]

for old, new in replacements:
    content = re.sub(old, new, content)

content = re.sub(r'(bg-\[\#D4A017\]\s+)text-white', r'\1text-[#1A0A04]', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
