import AppKit
import PDFKit

// Run from the project root: swift scripts/render-portfolio.swift
let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
guard let document = PDFDocument(url: root.appendingPathComponent("public/portfolio-emma-expert-2026.pdf")) else {
    fatalError("Portfolio PDF unavailable")
}
let assets = root.appendingPathComponent("src/assets")
let files = try FileManager.default.contentsOfDirectory(atPath: assets.path)
for file in files.sorted() where file.hasPrefix("page-") && file.hasSuffix(".jpg") {
    guard let number = Int(file.dropFirst(5).dropLast(4)), let page = document.page(at: number - 1) else {
        fatalError("Invalid portfolio page: \(file)")
    }
    let bounds = page.bounds(for: .mediaBox)
    let width = 3840
    let height = Int((Double(width) * bounds.height / bounds.width).rounded())
    guard let context = CGContext(data: nil, width: width, height: height, bitsPerComponent: 8,
        bytesPerRow: 0, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue) else {
        fatalError("Cannot create image context")
    }
    context.setFillColor(CGColor(gray: 1, alpha: 1))
    context.fill(CGRect(x: 0, y: 0, width: width, height: height))
    context.scaleBy(x: CGFloat(width) / bounds.width, y: CGFloat(height) / bounds.height)
    context.translateBy(x: -bounds.minX, y: -bounds.minY)
    context.interpolationQuality = .high
    page.draw(with: .mediaBox, to: context)
    guard let image = context.makeImage(), let data = NSBitmapImageRep(cgImage: image)
        .representation(using: .jpeg, properties: [.compressionFactor: 0.95]) else {
        fatalError("Cannot encode image")
    }
    try data.write(to: assets.appendingPathComponent(file))
    print("\(file): \(width) × \(height)")
}
