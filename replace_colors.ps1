$filePath = "c:\cakecampus-build\src\components\screens\AdminScreen.tsx"
$content = Get-Content -Path $filePath -Raw -Encoding UTF8

$replacements = @(
    @('bg-white text-rose-600 shadow-xs', 'bg-[#FFF8EE] text-[#D4A017] shadow-xs'),
    @('text-zinc-600 hover:text-zinc-900', 'text-[#7C5542] hover:text-[#1A0A04]'),
    @('text-zinc-600 hover:text-rose-600', 'text-[#7C5542] hover:text-[#D4A017]'),
    @('border-2 border-rose-300', 'border-2 border-[#D4A017]/30'),
    @('hover:bg-rose-600', 'hover:bg-[#D4A017]'),
    @('hover:bg-rose-700', 'hover:bg-[#C8860A]'),
    @('hover:bg-rose-100', 'hover:bg-[#D4A017]/15'),
    @('disabled:bg-rose-400', 'disabled:bg-[#D4A017]/60'),
    @('disabled:bg-rose-300', 'disabled:bg-[#D4A017]/50'),
    @('focus:border-rose-500', 'focus:border-[#D4A017]'),
    @('shadow-rose-600/20', 'shadow-[#D4A017]/20'),
    @('shadow-rose-600/30', 'shadow-[#D4A017]/30'),
    @('text-rose-600', 'text-[#D4A017]'),
    @('text-rose-700', 'text-[#C8860A]'),
    @('text-rose-800', 'text-[#7C5542]'),
    @('text-rose-900', 'text-[#1A0A04]'),
    @('bg-rose-600', 'bg-[#D4A017]'),
    @('bg-rose-50', 'bg-[#D4A017]/10'),
    @('bg-rose-100', 'bg-[#D4A017]/15'),
    @('border-rose-200', 'border-[#D4A017]/25'),
    @('border-rose-300', 'border-[#D4A017]/30'),
    @('bg-white', 'bg-[#FFF8EE]'),
    @('text-zinc-500', 'text-[#7C5542]'),
    @('text-zinc-600', 'text-[#7C5542]'),
    @('text-zinc-700', 'text-[#7C5542]'),
    @('text-zinc-400', 'text-[#7C5542]/70'),
    @('text-zinc-800', 'text-[#1A0A04]'),
    @('text-zinc-900', 'text-[#1A0A04]'),
    @('text-[#2A050F]', 'text-[#1A0A04]'),
    @('bg-[#FAF7F5]', 'bg-[#F5EDE4]'),
    @('border-[#E8DED6]', 'border-[#D4A017]/20'),
    @('border-zinc-200', 'border-[#D4A017]/20'),
    @('border-zinc-100', 'border-[#D4A017]/15')
)

foreach ($pair in $replacements) {
    $content = $content.Replace($pair[0], $pair[1])
}

$content = [regex]::Replace($content, '(bg-\[\#D4A017\]\s+)text-white', '${1}text-[#1A0A04]')

[System.IO.File]::WriteAllText($filePath, $content, (New-Object System.Text.UTF8Encoding($false)))
